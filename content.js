let monitoringInterval = null;
let isMonitoring = false;
let lastRefreshTime = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[DEBUG] content: Received message:", message.action);
  
  if (message.action === 'startMonitoring') {
    startElementMonitoring();
    sendResponse({success: true});
  } else if (message.action === 'stopMonitoring') {
    stopElementMonitoring();
    sendResponse({success: true});
  }
});

function startElementMonitoring() {
  isMonitoring = true;
  
  chrome.runtime.sendMessage({
    action: 'monitoringStatus',
    status: 'started',
    details: `URL: ${window.location.href}`
  });
  
  console.log("[DEBUG] content: Starting monitoring, checking element immediately");
  checkElementOnCurrentPage();
}

async function checkElementOnCurrentPage() {
  if (!isMonitoring) {
    console.log("[DEBUG] content: Monitoring disabled, skipping element check");
    return;
  }
  
  console.log("[DEBUG] content: Checking for .simei elements on current page");
  
  try {
    const simeiElements = document.querySelectorAll('a.simei');
    
    if (simeiElements.length > 0) {
      console.log(`[DEBUG] content: Found ${simeiElements.length} simei elements!`);
      
      const allSlotData = [];
      
      simeiElements.forEach((link, index) => {
        const slotData = {
          type: 'simei',
          time: link.getAttribute("data-time"),
          date: link.getAttribute("data-date"),
          week: link.getAttribute("data-week"),
          url: window.location.href,
        };
        
        console.log(`[DEBUG] content: Simei element ${index + 1} data:`, slotData);
        allSlotData.push(slotData);
        
        chrome.runtime.sendMessage({
          action: 'elementFound',
          slotData: slotData,
          elementIndex: index + 1,
          totalElements: simeiElements.length
        });
      });
      
      sendAlert(allSlotData);
    } else {
      console.log("[DEBUG] content: No simei elements found");
      chrome.runtime.sendMessage({action: 'elementNotFound'});
    }
    
    console.log("[DEBUG] content: Element check completed, scheduling UI automation in 60 seconds");
    scheduleUIAutomation();
  } catch (error) {
    console.error("[DEBUG] content: Error during element check:", error);
    chrome.runtime.sendMessage({
      action: 'monitoringStatus',
      status: 'check_failed',
      details: error.message
    });
    scheduleUIAutomation();
  }
}

function scheduleUIAutomation() {
  if (!isMonitoring) {
    console.log("[DEBUG] content: Monitoring disabled, not scheduling UI automation");
    return;
  }
  
  console.log("[DEBUG] content: Scheduling UI automation in 60 seconds");
  monitoringInterval = setTimeout(() => {
    console.log("[DEBUG] content: Timer triggered, performing UI automation");
    performUIAutomation();
  }, 60000);
}

async function performUIAutomation() {
  if (!isMonitoring) {
    console.log("[DEBUG] content: Monitoring disabled, skipping UI automation");
    return;
  }
  
  console.log("[DEBUG] content: Starting UI automation cycle");
  
  try {
    await refreshPageData();
    console.log("[DEBUG] content: UI automation completed, page will refresh and check element again");
  } catch (error) {
    console.error("[DEBUG] content: Error during UI automation:", error);
    chrome.runtime.sendMessage({
      action: 'monitoringStatus',
      status: 'automation_failed',
      details: error.message
    });
    
    sendUrgentAlert();
    
    console.log("[DEBUG] content: UI automation failed, scheduling next attempt");
    scheduleUIAutomation();
  }
}

function stopElementMonitoring() {
  isMonitoring = false;
  
  if (monitoringInterval) {
    clearTimeout(monitoringInterval);
    monitoringInterval = null;
    console.log("[DEBUG] content: Cleared monitoring timer");
  }
  
  chrome.runtime.sendMessage({
    action: 'monitoringStatus',
    status: 'stopped',
    details: 'Manual stop'
  });
}

async function refreshPageData() {
  console.log("[DEBUG] content: Starting page data refresh");

  try {
    lastRefreshTime = Date.now();
    console.log("[DEBUG] content: Recorded refresh time:", lastRefreshTime);

    const dropdownButton = document.querySelector(
      'a#navbarDropdown[role="button"]'
    );
    if (!dropdownButton) {
      throw new Error("Dropdown button not found");
    }
    console.log("[DEBUG] content: Found dropdown button");
    dropdownButton.click();
    console.log("[DEBUG] content: Clicked dropdown button");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const reservationLink = document.querySelector(
      'a[data-kamoku="0"]'
    );
    if (!reservationLink) {
      throw new Error("Reservation link not found");
    }
    console.log("[DEBUG] content: Found reservation link");
    reservationLink.click();
    console.log("[DEBUG] content: Clicked reservation link, page will refresh");
  } catch (error) {
    console.error("[DEBUG] content: Error during page refresh:", error);
    lastRefreshTime = 0;
    chrome.runtime.sendMessage({
      action: 'monitoringStatus',
      status: 'refresh_failed',
      details: error.message
    });
    throw error;
  }
}

function sendAlert(allSlotData) {
  try {
    const slotStrings = allSlotData.map(slot => `${slot.date} ${slot.time}`);
    const uniqueSlotStrings = [...new Set(slotStrings)];
    const message = `New Slot!! ${uniqueSlotStrings.join(', ')}`;
    
    console.log("[DEBUG] content: Sending alert message:", message);
    
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://ntfy.sh/reserve_alert_xiao", true);
    xhr.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          chrome.runtime.sendMessage({
            action: 'monitoringStatus',
            status: 'alert_sent',
            details: `Successfully sent: ${message}`
          });
        } else {
          chrome.runtime.sendMessage({
            action: 'monitoringStatus',
            status: 'alert_failed',
            details: `HTTP ${xhr.status}: ${xhr.statusText}`
          });
        }
      }
    };
    
    xhr.onerror = function() {
      chrome.runtime.sendMessage({
        action: 'monitoringStatus',
        status: 'alert_failed',
        details: 'Network error'
      });
    };
    
    xhr.send(message);
  } catch (error) {
    chrome.runtime.sendMessage({
      action: 'monitoringStatus',
      status: 'alert_failed',
      details: error.message
    });
  }
}

function sendUrgentAlert() {
  try {
    console.log("[DEBUG] content: Sending urgent alert - page down");
    
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://ntfy.sh/reserve_alert_xiao", true);
    xhr.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          chrome.runtime.sendMessage({
            action: 'monitoringStatus',
            status: 'urgent_alert_sent',
            details: 'Successfully sent urgent alert'
          });
        } else {
          chrome.runtime.sendMessage({
            action: 'monitoringStatus',
            status: 'urgent_alert_failed',
            details: `HTTP ${xhr.status}: ${xhr.statusText}`
          });
        }
      }
    };
    
    xhr.onerror = function() {
      chrome.runtime.sendMessage({
        action: 'monitoringStatus',
        status: 'urgent_alert_failed',
        details: 'Network error on urgent alert'
      });
    };
    
    xhr.send("URGENT, page down!");
  } catch (error) {
    chrome.runtime.sendMessage({
      action: 'monitoringStatus',
      status: 'urgent_alert_failed',
      details: error.message
    });
  }
}

window.addEventListener('beforeunload', () => {
  if (monitoringInterval) {
    clearTimeout(monitoringInterval);
    console.log("[DEBUG] content: Cleared timer due to page unload");
  }
});

console.log("[DEBUG] content: Content script loaded/reloaded");

chrome.storage.local.get(['isMonitoring'], (result) => {
  console.log("[DEBUG] content: Checking stored monitoring state:", result.isMonitoring);
  if (result.isMonitoring) {
    console.log("[DEBUG] content: Restoring monitoring state and checking element immediately");
    isMonitoring = true;
    checkElementOnCurrentPage();
  } else {
    console.log("[DEBUG] content: Monitoring not active");
  }
});