let activeBlock = false;
let endTime = null;
let scheduledChecks;

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

function startScheduleChecker() {
  // Clear any existing interval
  if (scheduledChecks) clearInterval(scheduledChecks);
  
  // Check every minute
  scheduledChecks = setInterval(checkSchedules, 60000);
  checkSchedules(); // Check immediately too
}

function checkSchedules() {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  chrome.storage.sync.get('schedules', (data) => {
    const schedules = data.schedules || [];
    
    const dayMap = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    schedules.forEach(schedule => {
      schedule.days.forEach(day => {
        if (dayMap[day] === currentDay) {
          schedule.times.forEach(time => {
            const scheduleStart = convertToMinutes(time.start.time, time.start.period);
            const scheduleEnd = convertToMinutes(time.end.time, time.end.period);
            
            if (currentTime === scheduleStart) {
              // Start blocking
              startBlocking(scheduleEnd - scheduleStart);
            }
          });
        }
      });
    });
  });
}

// Start the checker when the extension loads
startScheduleChecker();

// Add this function to background.js
function convertToMinutes(time, period) {
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + (minutes || 0);
  
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes = minutes || 0;
  
  return totalMinutes;
} 