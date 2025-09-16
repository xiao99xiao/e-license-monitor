chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isMonitoring: false,
    simeiSelector: "a.simei",
    reservationSelector: 'a[data-kamoku="0"]',
    debugLogs: ["Extension installed and ready"],
  });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "startMonitoring") {
    await chrome.storage.local.set({ isMonitoring: true });
    addDebugLog("🚀 Monitoring enabled");
  } else if (message.action === "stopMonitoring") {
    await chrome.storage.local.set({ isMonitoring: false });
    addDebugLog("⏹️ Monitoring disabled");
  } else if (message.action === "elementFound") {
    if (message.slotData) {
      const slotInfo = `time: ${message.slotData.time}, date: ${message.slotData.date}, week: ${message.slotData.week}`;
      addDebugLog(
        `🎯 ${message.slotData.type.toUpperCase()} element ${
          message.elementIndex
        }/${message.totalElements} found! ${slotInfo}`
      );
    } else {
      addDebugLog("🎯 Element found! Alert sent to ntfy.sh");
    }
  } else if (message.action === "elementNotFound") {
    addDebugLog("🔍 Element not found");
  } else if (message.action === "monitoringStatus") {
    addDebugLog(`📊 ${message.status}: ${message.details}`);
  } else if (message.action === "selectorsUpdated") {
    addDebugLog(
      `🔧 Selectors updated: simei="${message.simeiSelector}", reservation="${message.reservationSelector}"`
    );
  }
});

async function addDebugLog(message) {
  try {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;

    const result = await chrome.storage.local.get(["debugLogs"]);
    const logs = result.debugLogs || [];
    logs.unshift(logEntry);

    if (logs.length > 30) {
      logs.splice(30);
    }

    await chrome.storage.local.set({ debugLogs: logs });
  } catch (error) {
    console.error("Error saving debug log:", error);
  }
}
