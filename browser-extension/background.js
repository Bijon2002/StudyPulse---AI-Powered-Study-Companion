// background.js

// --- Configuration ---
const SYNC_INTERVAL_MINUTES = 0.5; // Changed from 15 to 0.5 for testing
let currentSession = null;
let allowlist = []; // In-memory cache of allowed domains
let manualMode = false;
let focusMode = false; // New: Strict blocking mode

// --- Initialization ---
chrome.runtime.onInstalled.addListener(async () => {
  console.log("EduTracker Installed");
  await loadAllowlist();

  // Request notification permission
  chrome.permissions.request({
    permissions: ['notifications']
  });

  // Setup periodic sync
  chrome.alarms.create("syncData", { periodInMinutes: SYNC_INTERVAL_MINUTES });
});

// Listen for Popup Messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.type === "START_MANUAL") {
    manualMode = true;
    chrome.storage.local.set({ manualMode: true });

    // Immediately check current tab to start tracking
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) handleActivityChange(tabs[0]);
    });

    // Notify user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.svg',
      title: 'EduTracker',
      message: 'Manual study mode activated! Tracking all sites.'
    });

  } else if (message.type === "STOP_MANUAL") {
    manualMode = false;
    chrome.storage.local.set({ manualMode: false });
    stopTracking();

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.svg',
      title: 'EduTracker',
      message: 'Manual study mode deactivated.'
    });

  } else if (message.type === "START_FOCUS") {
    focusMode = true;
    chrome.storage.local.set({ focusMode: true });
    chrome.action.setBadgeText({ text: "BLK" });
    chrome.action.setBadgeBackgroundColor({ color: "#7c3aed" }); // Purple

    // Check current tab immediately
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) handleFocusBlocking(tabs[0].id, tabs[0].url);
    });

    sendResponse({ success: true });

  } else if (message.type === "STOP_FOCUS") {
    focusMode = false;
    chrome.storage.local.set({ focusMode: false });
    chrome.action.setBadgeText({ text: "" });
    sendResponse({ success: true });

  } else if (message.type === "FORCE_SYNC") {
    syncDataToBackend();
    sendResponse({ success: true });

  } else if (message.type === "GET_STATUS") {
    // Return current extension status
    sendResponse({
      manualMode: manualMode,
      focusMode: focusMode,
      currentSession: currentSession,
      allowlist: allowlist
    });

  } else if (message.type === "ADD_SITE") {
    // Add site to allowlist
    const domain = message.domain;
    if (domain && !allowlist.includes(domain)) {
      allowlist.push(domain);
      chrome.storage.local.set({ allowlist });
      updateServerAllowlist();
      sendResponse({ success: true, allowlist: allowlist });
    } else {
      sendResponse({ success: false, error: 'Site already in allowlist' });
    }

  } else if (message.type === "REMOVE_SITE") {
    // Remove site from allowlist
    const domain = message.domain;
    const index = allowlist.indexOf(domain);
    if (index > -1) {
      allowlist.splice(index, 1);
      chrome.storage.local.set({ allowlist });
      updateServerAllowlist();
      sendResponse({ success: true, allowlist: allowlist });

      // If current session is on this domain, stop tracking
      if (currentSession && currentSession.domain === domain) {
        stopTracking();
      }
    } else {
      sendResponse({ success: false, error: 'Site not found' });
    }

  } else if (message.type === "PAUSE_TRACKING") {
    // Pause tracking temporarily
    const wasManualMode = manualMode;
    manualMode = false;
    stopTracking();
    sendResponse({ success: true, wasManualMode: wasManualMode });

  } else if (message.type === "RESUME_TRACKING") {
    // Resume tracking
    manualMode = message.wasManualMode || false;
    chrome.storage.local.set({ manualMode: manualMode });

    // Check current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) handleActivityChange(tabs[0]);
    });
    sendResponse({ success: true });
  }
});

// Load allowlist from storage or default
async function loadAllowlist() {
  try {
    // Try fetching from server first
    const response = await fetch('http://localhost:3000/api/settings/allowlist');
    if (response.ok) {
      const data = await response.json();
      if (data.allowlist) {
        allowlist = data.allowlist;
        await chrome.storage.local.set({ allowlist });
        console.log("Allowlist synced from server:", allowlist);
        return;
      }
    }
  } catch (e) {
    console.warn("Failed to sync allowlist from server, falling back to local storage", e);
  }

  // Fallback to local storage
  const result = await chrome.storage.local.get("allowlist");
  if (result.allowlist) {
    allowlist = result.allowlist;
  } else {
    // Default allowed sites for demo (if nothing local)
    allowlist = ["leetcode.com", "coursera.org", "react.dev", "developer.mozilla.org", "youtube.com"];
    await chrome.storage.local.set({ allowlist });
  }
  console.log("Allowlist loaded:", allowlist);
}

// --- Tracking Logic ---

// 1. Tab Activated (Switched to a new tab)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleActivityChange(tab);
});

// 2. Tab Updated (Navigated to a new URL in same tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    handleActivityChange(tab);
  }
});

// 3. Window Focus Changed (Browser minimized or lost focus)
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus -> Stop tracking
    stopTracking();
  } else {
    // Browser regained focus -> Check active tab
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab) {
      handleActivityChange(tab);
    }
  }
});

// Blocking Helper
function handleFocusBlocking(tabId, urlString) {
  if (!focusMode || !urlString) return;

  try {
    // Skip extension pages and browser pages
    if (urlString.startsWith("chrome://") || urlString.startsWith("chrome-extension://")) return;

    const url = new URL(urlString);
    const domain = url.hostname.replace("www.", "");

    if (!isAllowed(domain)) {
      console.log(`Focus Mode: Blocking ${domain}`);
      const blockedPageUrl = chrome.runtime.getURL("blocked.html");
      if (urlString !== blockedPageUrl) {
        chrome.tabs.update(tabId, { url: blockedPageUrl });
      }
    }
  } catch (e) {
    // Ignore invalid URLs
    console.error("Blocking error", e);
  }
}

// Core Logic
function handleActivityChange(tab) {
  stopTracking(); // Stop previous session if any

  if (!tab.url) return;

  // FOCUS MODE CHECK
  if (focusMode) {
    handleFocusBlocking(tab.id, tab.url);
  }

  try {
    const url = new URL(tab.url);
    const domain = url.hostname.replace("www.", "");

    if (isAllowed(domain)) {
      startTracking(domain);
    }
  } catch (e) {
    // Ignore invalid URLs (chrome://, etc.)
  }
}

function isAllowed(domain) {
  // Always allow localhost/dashboard so users can disable Focus Mode
  // Also allow LAN IPs (192.168.x.x, 10.x.x.x, 172.x.x.x)
  if (domain.includes("localhost") ||
    domain.includes("127.0.0.1") ||
    domain.startsWith("192.168.") ||
    domain.startsWith("10.") ||
    domain.startsWith("172.")) return true;

  // If Manual Mode is ON, allow EVERYTHING
  if (manualMode) return true;

  // Simple check: is domain in allowlist?
  // In production, we'd use regex or more robust matching
  return allowlist.some(allowed => domain.includes(allowed));
}

function startTracking(domain) {
  currentSession = {
    domain: domain,
    startTime: Date.now()
  };

  // Update badge
  if (focusMode) {
    // Already handled
  } else if (manualMode) {
    chrome.action.setBadgeText({ text: "REC" }); // Recording
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" }); // Red
  } else {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e" }); // Green
  }

  console.log(`Tracking started: ${domain} (Manual: ${manualMode})`);
}

function stopTracking() {
  if (currentSession) {
    const duration = (Date.now() - currentSession.startTime) / 1000; // seconds

    if (duration > 5) { // Filter out micro-sessions (< 5s)
      saveSession({
        domain: currentSession.domain,
        startTime: currentSession.startTime,
        duration: duration,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Tracking stopped: ${currentSession.domain} (${duration}s)`);
    currentSession = null;
  }

  // Clear badge
  chrome.action.setBadgeText({ text: "" });
}

async function saveSession(session) {
  const result = await chrome.storage.local.get("sessions");
  const sessions = result.sessions || [];
  sessions.push(session);
  await chrome.storage.local.set({ sessions });
}

// --- Sync Logic ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncData") {
    syncDataToBackend();
    loadAllowlist(); // Also sync settings periodically
  }
});

async function updateServerAllowlist() {
  try {
    await fetch('http://localhost:3000/api/settings/allowlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowlist: allowlist })
    });
  } catch (error) {
    console.error("Failed to update server allowlist:", error);
  }
}

async function syncDataToBackend() {
  const result = await chrome.storage.local.get("sessions");
  const sessions = result.sessions || [];

  if (sessions.length === 0) return;

  console.log("Syncing sessions to backend...", sessions);

  try {
    const response = await fetch('http://localhost:3000/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessions })
    });

    if (response.ok) {
      console.log("Sync successful. Clearing local buffer.");
      await chrome.storage.local.set({ sessions: [] });
    } else {
      console.error("Sync failed:", response.statusText);
    }
  } catch (error) {
    console.error("Sync error:", error);
  }
}
