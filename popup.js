let isMonitoring = false;

document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');
  const debugInfo = document.getElementById('debugInfo');

  loadState();

  startBtn.addEventListener('click', startMonitoring);
  stopBtn.addEventListener('click', stopMonitoring);

  setInterval(updateDebugInfo, 1000);
});

async function loadState() {
  try {
    const result = await chrome.storage.local.get(['isMonitoring', 'debugLogs']);
    isMonitoring = result.isMonitoring || false;
    updateUI();
    
    if (result.debugLogs) {
      updateDebugDisplay(result.debugLogs);
    }
  } catch (error) {
    addDebugLog('Error loading state: ' + error.message);
  }
}

async function startMonitoring() {
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    if (!tab.url.includes('e-license.jp')) {
      addDebugLog('Error: Not on e-license.jp domain');
      return;
    }

    isMonitoring = true;
    await chrome.storage.local.set({isMonitoring: true});
    
    await chrome.runtime.sendMessage({action: 'startMonitoring'});
    await chrome.tabs.sendMessage(tab.id, {action: 'startMonitoring'});
    
    addDebugLog('Monitoring started on: ' + tab.url);
    updateUI();
  } catch (error) {
    addDebugLog('Error starting monitor: ' + error.message);
  }
}

async function stopMonitoring() {
  try {
    isMonitoring = false;
    await chrome.storage.local.set({isMonitoring: false});
    
    await chrome.runtime.sendMessage({action: 'stopMonitoring'});
    
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab.url.includes('e-license.jp')) {
      await chrome.tabs.sendMessage(tab.id, {action: 'stopMonitoring'});
    }
    
    addDebugLog('Monitoring stopped');
    updateUI();
  } catch (error) {
    addDebugLog('Error stopping monitor: ' + error.message);
  }
}

function updateUI() {
  const statusDiv = document.getElementById('status');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');

  if (isMonitoring) {
    statusDiv.className = 'status monitoring';
    statusDiv.innerHTML = '<div class="status-dot"></div><span>Monitoring Active</span>';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    statusDiv.className = 'status stopped';
    statusDiv.innerHTML = '<div class="status-dot"></div><span>Monitoring Stopped</span>';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

async function addDebugLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  
  try {
    const result = await chrome.storage.local.get(['debugLogs']);
    const logs = result.debugLogs || [];
    logs.unshift(logEntry);
    
    if (logs.length > 20) {
      logs.splice(20);
    }
    
    await chrome.storage.local.set({debugLogs: logs});
    updateDebugDisplay(logs);
  } catch (error) {
    console.error('Error saving debug log:', error);
  }
}

function updateDebugDisplay(logs) {
  const debugInfo = document.getElementById('debugInfo');
  debugInfo.innerHTML = logs.map(log => 
    `<div class="debug-item">${log}</div>`
  ).join('');
}

async function updateDebugInfo() {
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const isELicense = tab.url.includes('e-license.jp');
    
    if (!isELicense && isMonitoring) {
      addDebugLog('Warning: Not on e-license.jp domain');
    }
    
    const result = await chrome.storage.local.get(['debugLogs']);
    if (result.debugLogs) {
      updateDebugDisplay(result.debugLogs);
    }
  } catch (error) {
    console.error('Error updating debug info:', error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'elementFound') {
    addDebugLog('Element with class="simei" found! Alert sent.');
  } else if (message.action === 'elementNotFound') {
    addDebugLog('Element check: class="simei" not found');
  } else if (message.action === 'monitoringStatus') {
    addDebugLog(`Monitor ${message.status}: ${message.details}`);
  }
});