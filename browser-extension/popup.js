// Popup script

let blockedSites = [];

// Load data on popup open
document.addEventListener('DOMContentLoaded', () => {
  loadFocusMode();
  loadStats();
  loadBlockedSites();
});

// Load focus mode state
function loadFocusMode() {
  chrome.runtime.sendMessage({ action: 'getFocusMode' }, (response) => {
    if (response) {
      document.getElementById('focusModeToggle').checked = response.focusMode;
      blockedSites = response.blockedSites || [];
    }
  });
}

// Load today's stats
function loadStats() {
  chrome.runtime.sendMessage({ action: 'getTimeData' }, (response) => {
    if (response && response.timeData) {
      const today = new Date().toISOString().split('T')[0];
      const todayData = response.timeData[today] || {};
      
      // Calculate total time
      let totalSeconds = 0;
      let sitesCount = 0;
      
      for (const domain in todayData) {
        totalSeconds += todayData[domain];
        sitesCount++;
      }
      
      // Display
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      document.getElementById('totalTime').textContent = 
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      document.getElementById('sitesVisited').textContent = sitesCount;
    }
  });
}

// Load blocked sites list
function loadBlockedSites() {
  chrome.runtime.sendMessage({ action: 'getFocusMode' }, (response) => {
    if (response && response.blockedSites) {
      blockedSites = response.blockedSites;
      displayBlockedSites();
    }
  });
}

// Display blocked sites
function displayBlockedSites() {
  const listEl = document.getElementById('blockedList');
  listEl.innerHTML = '';
  
  blockedSites.forEach((site, index) => {
    const item = document.createElement('div');
    item.className = 'blocked-item';
    item.innerHTML = `
      <span>${site}</span>
      <button class="remove-btn" onclick="removeSite(${index})">Remove</button>
    `;
    listEl.appendChild(item);
  });
}

// Toggle focus mode
document.getElementById('focusModeToggle').addEventListener('change', (e) => {
  const enabled = e.target.checked;
  chrome.runtime.sendMessage({ 
    action: 'setFocusMode', 
    enabled 
  }, (response) => {
    if (response.success) {
      console.log('Focus mode:', enabled ? 'ON' : 'OFF');
    }
  });
});

// Add site to blocked list
function addSite() {
  const input = document.getElementById('newSite');
  const site = input.value.trim().toLowerCase();
  
  if (site && !blockedSites.includes(site)) {
    blockedSites.push(site);
    chrome.runtime.sendMessage({ 
      action: 'setBlockedSites', 
      sites: blockedSites 
    }, (response) => {
      if (response.success) {
        input.value = '';
        displayBlockedSites();
      }
    });
  }
}

// Remove site from blocked list
function removeSite(index) {
  blockedSites.splice(index, 1);
  chrome.runtime.sendMessage({ 
    action: 'setBlockedSites', 
    sites: blockedSites 
  }, (response) => {
    if (response.success) {
      displayBlockedSites();
    }
  });
}

// Sync to main app
function syncToApp() {
  chrome.runtime.sendMessage({ action: 'syncToApp' }, (response) => {
    if (response && response.success) {
      alert('✅ Data synced to StudyPulse app!');
    } else {
      alert('⚠️ Make sure StudyPulse app is running at localhost:5173');
    }
  });
}

// Allow Enter key to add site
document.getElementById('newSite').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addSite();
  }
});
