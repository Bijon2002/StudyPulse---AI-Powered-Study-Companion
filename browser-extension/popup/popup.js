document.addEventListener('DOMContentLoaded', async () => {
  // 1. Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname.replace("www.", "");
      document.getElementById('current-domain').textContent = domain;

      // Check if active
      const result = await chrome.storage.local.get("allowlist");
      const allowlist = result.allowlist || [];
      const isAllowed = allowlist.some(allowed => domain.includes(allowed));

      const badge = document.getElementById('status-badge');
      if (isAllowed) {
        badge.textContent = "Tracking";
        badge.className = "tracking-badge badge-active";
      } else {
        badge.textContent = "Inactive";
        badge.className = "tracking-badge badge-inactive";
      }
    } catch (e) {
      document.getElementById('current-domain').textContent = "Restricted Page";
    }
  }

  // 1.5 Get extension status
  const statusResponse = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  if (statusResponse) {
    updateUIWithStatus(statusResponse);
  }

  // 2. Load Stats
  const storage = await chrome.storage.local.get(["sessions", "manualMode"]);
  const sessions = storage.sessions || [];

  // Get detailed session info
  const today = new Date().toDateString();
  const todaysSessions = sessions.filter(s => new Date(s.timestamp).toDateString() === today);
  const thisWeekSessions = sessions.filter(s =>
    new Date(s.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  // Calculate domain usage
  const domainUsage = sessions.reduce((acc, session) => {
    acc[session.domain] = (acc[session.domain] || 0) + session.duration;
    return acc;
  }, {});

  const topDomains = Object.entries(domainUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Calculate today's stats
  const totalSeconds = todaysSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const totalWeekSeconds = thisWeekSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const weekMinutes = Math.floor(totalWeekSeconds / 60);

  document.getElementById('session-count').textContent = todaysSessions.length;
  document.getElementById('total-time').textContent = `${minutes}m`;

  // Add weekly stats if different from today
  if (weekMinutes > minutes) {
    const weeklyStats = document.createElement('div');
    weeklyStats.className = 'stats-row';
    weeklyStats.innerHTML = `
      <div class="stat-item">
        <div class="stat-val">${thisWeekSessions.length}</div>
        <div class="status-label">This Week</div>
      </div>
      <div class="stat-item">
        <div class="stat-val">${weekMinutes}m</div>
        <div class="status-label">Week Total</div>
      </div>
    `;
    document.querySelector('.status-card:nth-child(4)').appendChild(weeklyStats);
  }

  // Add top domains if available
  if (topDomains.length > 0) {
    const domainsSection = document.createElement('div');
    domainsSection.className = 'status-card';
    domainsSection.innerHTML = `
      <div class="status-label">Top Websites</div>
      <div class="space-y-2 mt-2">
        ${topDomains.map(([domain, seconds]) => `
          <div class="flex justify-between text-sm">
            <span class="truncate max-w-[120px]">${domain}</span>
            <span class="font-medium">${Math.round(seconds / 60)}m</span>
          </div>
        `).join('')}
      </div>
    `;
    const statsCard = document.querySelector('.status-card:nth-child(4)');
    statsCard.parentNode.insertBefore(domainsSection, statsCard.nextSibling);
  }

  // 3. Manual Mode & Focus Mode UI
  updateManualButton(storage.manualMode || false);

  // Note: We need to wait for status response to update Focus Mode button, 
  // but we set up the listeners here.

  // Add Quick Actions
  addQuickActionButtons();

  // Manual Toggle
  const manualBtn = document.getElementById('manual-toggle');
  manualBtn.addEventListener('click', async () => {
    // Send message to background
    const isRunning = manualBtn.textContent.includes("Stop");
    const action = isRunning ? "STOP_MANUAL" : "START_MANUAL";

    await chrome.runtime.sendMessage({ type: action });
    updateManualButton(!isRunning);
    setTimeout(() => window.close(), 1500);
  });

  // Focus Toggle
  const focusBtn = document.getElementById('focus-toggle');
  focusBtn.addEventListener('click', async () => {
    const isEnabled = focusBtn.textContent.includes("Disable");
    const action = isEnabled ? "STOP_FOCUS" : "START_FOCUS";

    await chrome.runtime.sendMessage({ type: action });
    updateFocusButton(!isEnabled);

    showNotification(isEnabled ? "Focus Mode Disabled" : "Focus Mode Enabled");
    setTimeout(() => window.close(), 1000);
  });

  function updateManualButton(isActive) {
    const btn = document.getElementById('manual-toggle');
    const statusText = document.getElementById('manual-status');

    if (isActive) {
      btn.textContent = "Stop Manual Session";
      btn.style.backgroundColor = "#ef4444"; // Red to stop
      statusText.style.display = "block";
    } else {
      btn.textContent = "Start Manual Session";
      btn.style.backgroundColor = "#4b5563"; // Gray default
      statusText.style.display = "none";
    }
  }

  function updateFocusButton(isActive) {
    const btn = document.getElementById('focus-toggle');
    if (isActive) {
      btn.textContent = "Disable Focus Mode";
      btn.style.backgroundColor = "#991b1b"; // Dark Red
    } else {
      btn.textContent = "Enable Focus Mode";
      btn.style.backgroundColor = "#7c3aed"; // Purple
    }
  }

  function updateUIWithStatus(status) {
    // Update manual mode indicator
    updateManualButton(status.manualMode);
    updateFocusButton(status.focusMode);

    // Update current session info
    if (status.currentSession) {
      document.getElementById('current-domain').textContent = status.currentSession.domain;
      const badge = document.getElementById('status-badge');
      badge.textContent = "Active";
      badge.className = "tracking-badge badge-active";
    }
  }

  function addQuickActionButtons() {
    const container = document.createElement('div');
    container.className = 'status-card';
    container.innerHTML = `
      <div class="status-label">Quick Actions</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
        <button id="pause-btn" class="btn" style="background-color: #f59e0b; padding: 6px; font-size: 12px;">Pause</button>
        <button id="resume-btn" class="btn" style="background-color: #10b981; padding: 6px; font-size: 12px; display: none;">Resume</button>
        <button id="add-current-btn" class="btn" style="background-color: #8b5cf6; padding: 6px; font-size: 12px;">Add This Site</button>
        <button id="view-stats-btn" class="btn" style="background-color: #3b82f6; padding: 6px; font-size: 12px;">View Stats</button>
      </div>
    `;

    // Insert after manual mode section
    const manualSection = document.querySelector('.status-card:nth-child(3)');
    manualSection.parentNode.insertBefore(container, manualSection.nextSibling);

    // Add event listeners
    document.getElementById('pause-btn').addEventListener('click', pauseTracking);
    document.getElementById('resume-btn').addEventListener('click', resumeTracking);
    document.getElementById('add-current-btn').addEventListener('click', addCurrentSite);
    document.getElementById('view-stats-btn').addEventListener('click', viewDetailedStats);
  }

  async function pauseTracking() {
    const response = await chrome.runtime.sendMessage({ type: "PAUSE_TRACKING" });
    if (response.success) {
      document.getElementById('pause-btn').style.display = 'none';
      document.getElementById('resume-btn').style.display = 'block';
      document.getElementById('resume-btn').dataset.wasManualMode = response.wasManualMode;
      showNotification("Tracking paused");
    }
  }

  async function resumeTracking() {
    const wasManualMode = document.getElementById('resume-btn').dataset.wasManualMode === 'true';
    const response = await chrome.runtime.sendMessage({
      type: "RESUME_TRACKING",
      wasManualMode: wasManualMode
    });
    if (response.success) {
      document.getElementById('pause-btn').style.display = 'block';
      document.getElementById('resume-btn').style.display = 'none';
      updateManualButton(wasManualMode);
      showNotification("Tracking resumed");
    }
  }

  async function addCurrentSite() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      try {
        const url = new URL(tab.url);
        const domain = url.hostname.replace("www.", "");

        const response = await chrome.runtime.sendMessage({
          type: "ADD_SITE",
          domain: domain
        });

        if (response.success) {
          showNotification(`Added ${domain} to tracking list`);
          // Update UI
          const badge = document.getElementById('status-badge');
          badge.textContent = "Tracking";
          badge.className = "tracking-badge badge-active";
        } else {
          showNotification(response.error || "Failed to add site");
        }
      } catch (e) {
        showNotification("Cannot add this site");
      }
    }
  }

  function viewDetailedStats() {
    chrome.tabs.create({ url: 'http://localhost:5173/activity' });
    window.close();
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      right: 10px;
      background: #3b82f6;
      color: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
      z-index: 1000;
      animation: fadeIn 0.3s;
    `;

    // Add fade-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 2000);
  }

  // 4. Force Sync Button
  document.getElementById('force-sync').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: "FORCE_SYNC" });
    const btn = document.getElementById('force-sync');
    btn.textContent = "Synced!";
    setTimeout(() => { btn.textContent = "Sync Now"; }, 2000);
  });

  // 5. Dashboard Button Handler
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });
});
