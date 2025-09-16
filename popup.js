let isMonitoring = false;

document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const statusDiv = document.getElementById("status");
  const debugInfo = document.getElementById("debugInfo");
  const simeiSelectorInput = document.getElementById("simeiSelectorInput");
  const selectorInput = document.getElementById("selectorInput");
  const saveConfigBtn = document.getElementById("saveConfigBtn");

  loadState();

  startBtn.addEventListener("click", startMonitoring);
  stopBtn.addEventListener("click", stopMonitoring);
  saveConfigBtn.addEventListener("click", saveConfiguration);

  setInterval(updateDebugInfo, 1000);
});

async function loadState() {
  try {
    const result = await chrome.storage.local.get([
      "isMonitoring",
      "debugLogs",
      "reservationSelector",
      "simeiSelector",
    ]);

    console.log("Loading state from storage:", result);
    isMonitoring = result.isMonitoring || false;

    // Load selector configurations
    const simeiSelectorInput = document.getElementById("simeiSelectorInput");
    const selectorInput = document.getElementById("selectorInput");

    const simeiValue = result.simeiSelector || "a.simei";
    const reservationValue = result.reservationSelector || 'a[data-kamoku="0"]';

    simeiSelectorInput.value = simeiValue;
    selectorInput.value = reservationValue;

    console.log(
      "Set input values - simei:",
      simeiValue,
      "reservation:",
      reservationValue
    );
    addDebugLog(
      `Loaded selectors: simei="${simeiValue}", reservation="${reservationValue}"`
    );

    updateUI();

    if (result.debugLogs) {
      updateDebugDisplay(result.debugLogs);
    }
  } catch (error) {
    addDebugLog("Error loading state: " + error.message);
  }
}

async function startMonitoring() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.url.includes("e-license.jp")) {
      addDebugLog("Error: Not on e-license.jp domain");
      return;
    }

    isMonitoring = true;
    await chrome.storage.local.set({ isMonitoring: true });

    // Get current selector values and send them to content script
    const simeiSelectorInput = document.getElementById("simeiSelectorInput");
    const selectorInput = document.getElementById("selectorInput");
    const simeiSelector = simeiSelectorInput.value.trim();
    const reservationSelector = selectorInput.value.trim();

    await chrome.runtime.sendMessage({ action: "startMonitoring" });
    await chrome.tabs.sendMessage(tab.id, {
      action: "startMonitoring",
      simeiSelector: simeiSelector,
      reservationSelector: reservationSelector,
    });

    addDebugLog(
      `Monitoring started on: ${tab.url} with selectors simei="${simeiSelector}", reservation="${reservationSelector}"`
    );
    updateUI();
  } catch (error) {
    addDebugLog("Error starting monitor: " + error.message);
  }
}

async function stopMonitoring() {
  try {
    isMonitoring = false;
    await chrome.storage.local.set({ isMonitoring: false });

    await chrome.runtime.sendMessage({ action: "stopMonitoring" });

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.url.includes("e-license.jp")) {
      await chrome.tabs.sendMessage(tab.id, { action: "stopMonitoring" });
    }

    addDebugLog("Monitoring stopped");
    updateUI();
  } catch (error) {
    addDebugLog("Error stopping monitor: " + error.message);
  }
}

async function saveConfiguration() {
  try {
    const simeiSelectorInput = document.getElementById("simeiSelectorInput");
    const selectorInput = document.getElementById("selectorInput");
    const simeiSelector = simeiSelectorInput.value.trim();
    const reservationSelector = selectorInput.value.trim();

    console.log(
      "Saving configuration - simei:",
      simeiSelector,
      "reservation:",
      reservationSelector
    );

    if (!simeiSelector) {
      addDebugLog("Error: Slot elements selector cannot be empty");
      return;
    }

    if (!reservationSelector) {
      addDebugLog("Error: Reservation link selector cannot be empty");
      return;
    }

    const configData = {
      simeiSelector: simeiSelector,
      reservationSelector: reservationSelector,
    };

    console.log("Saving to storage:", configData);
    await chrome.storage.local.set(configData);

    // Verify the save worked
    const verifyResult = await chrome.storage.local.get([
      "simeiSelector",
      "reservationSelector",
    ]);
    console.log("Verification after save:", verifyResult);

    addDebugLog(
      `Configuration saved: simei="${simeiSelector}", reservation="${reservationSelector}"`
    );

    // Send updated selectors to content script if monitoring is active
    if (isMonitoring) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.url.includes("e-license.jp")) {
        console.log("Sending updateSelectors message to content script");
        await chrome.tabs.sendMessage(tab.id, {
          action: "updateSelectors",
          simeiSelector: simeiSelector,
          reservationSelector: reservationSelector,
        });
      }
    } else {
      console.log(
        "Monitoring not active, not sending message to content script"
      );
    }
  } catch (error) {
    console.error("Error saving configuration:", error);
    addDebugLog("Error saving configuration: " + error.message);
  }
}

function updateUI() {
  const statusDiv = document.getElementById("status");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  if (isMonitoring) {
    statusDiv.className = "status monitoring";
    statusDiv.innerHTML =
      '<div class="status-dot"></div><span>Monitoring Active</span>';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    statusDiv.className = "status stopped";
    statusDiv.innerHTML =
      '<div class="status-dot"></div><span>Monitoring Stopped</span>';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

async function addDebugLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;

  try {
    const result = await chrome.storage.local.get(["debugLogs"]);
    const logs = result.debugLogs || [];
    logs.unshift(logEntry);

    if (logs.length > 30) {
      logs.splice(30);
    }

    await chrome.storage.local.set({ debugLogs: logs });
    updateDebugDisplay(logs);
  } catch (error) {
    console.error("Error saving debug log:", error);
  }
}

function updateDebugDisplay(logs) {
  const debugInfo = document.getElementById("debugInfo");
  debugInfo.innerHTML = logs
    .map((log) => `<div class="debug-item">${log}</div>`)
    .join("");
}

async function updateDebugInfo() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const isELicense = tab.url.includes("e-license.jp");

    if (!isELicense && isMonitoring) {
      addDebugLog("Warning: Not on e-license.jp domain");
    }

    const result = await chrome.storage.local.get(["debugLogs"]);
    if (result.debugLogs) {
      updateDebugDisplay(result.debugLogs);
    }
  } catch (error) {
    console.error("Error updating debug info:", error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "elementFound") {
    addDebugLog('Element with class="simei" found! Alert sent.');
  } else if (message.action === "elementNotFound") {
    addDebugLog('Element check: class="simei" not found');
  } else if (message.action === "monitoringStatus") {
    addDebugLog(`Monitor ${message.status}: ${message.details}`);
  }
});
