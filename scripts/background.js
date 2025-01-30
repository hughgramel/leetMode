let activeBlock = false;
let endTime = null;

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (activeBlock && !isLeetCodeUrl(details.url) && details.frameId === 0) {
    chrome.tabs.update(details.tabId, {
      url: 'https://leetcode.com'
    });
  }
});

// Helper function to check if URL is LeetCode
function isLeetCodeUrl(url) {
  return url.includes('leetcode.com');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBlockingStatus') {
    // Return whether blocking is currently active
    sendResponse({ isBlocking: !!endTime });
    return true;
  }
  switch (request.action) {
    case 'startBlocking':
      activeBlock = true;
      endTime = Date.now() + (request.duration * 60 * 1000);
      scheduleBlockEnd(request.duration);
      sendResponse({ success: true });
      break;
    
    case 'stopBlocking':
      activeBlock = false;
      endTime = null;
      sendResponse({ success: true });
      break;
    
    case 'getStatus':
      sendResponse({
        active: activeBlock,
        endTime: endTime
      });
      break;
  }
  return true;
});

function scheduleBlockEnd(duration) {
  setTimeout(() => {
    activeBlock = false;
    endTime = null;
  }, duration * 60 * 1000);
} 