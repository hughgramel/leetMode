let activeBlock = false;
let endTime = null;
let scheduledChecks;
let blockEndTimer = null;

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only redirect if:
  // 1. Blocking is active
  // 2. It's not a LeetCode URL
  // 3. It's a main frame navigation (not an iframe/subframe)
  // 4. It's not a reload of the current page
  if (activeBlock && 
      !isLeetCodeUrl(details.url) && 
      details.frameId === 0 && 
      details.transitionType !== 'reload' && 
      details.transitionQualifiers.length === 0) {
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
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/icons/icon128.png',
        title: 'LeetMode Activated',
        message: `Blocking started for ${request.duration} minutes`
      });
      
      sendResponse({ success: true });
      break;
    
    case 'stopBlocking':
      activeBlock = false;
      endTime = null;
      if (blockEndTimer) {
        clearTimeout(blockEndTimer);
        blockEndTimer = null;
      }
      sendResponse({ success: true });
      break;
    
    case 'getStatus':
      chrome.storage.sync.get('schedules', (data) => {
        const schedules = data.schedules || [];
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Find current active schedule if any
        let activeScheduleTime = null;
        schedules.forEach(schedule => {
          schedule.days.forEach(day => {
            const dayMap = {
              'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
              'thursday': 4, 'friday': 5, 'saturday': 6
            };
            
            if (dayMap[day] === currentDay) {
              schedule.times.forEach(time => {
                const startMinutes = convertToMinutes(time.start.time, time.start.period);
                const endMinutes = convertToMinutes(time.end.time, time.end.period);
                
                if (currentTime >= startMinutes && currentTime < endMinutes) {
                  activeScheduleTime = time;
                }
              });
            }
          });
        });
        
        sendResponse({
          active: activeBlock,
          endTime: endTime,
          scheduledStart: activeScheduleTime?.start,
          scheduledEnd: activeScheduleTime?.end
        });
      });
      return true;
      break;
  }
  return true;
});

function scheduleBlockEnd(duration) {
  // Clear any existing timer
  if (blockEndTimer) {
    clearTimeout(blockEndTimer);
  }
  
  blockEndTimer = setTimeout(() => {
    activeBlock = false;
    endTime = null;
    blockEndTimer = null;
    
    // Notify that blocking has ended
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon128.png',
      title: 'LeetMode Deactivated',
      message: 'Scheduled blocking session has ended'
    });

    // Send message to popup to update UI
    chrome.runtime.sendMessage({
      action: 'stopBlocking'
    });
  }, duration * 60 * 1000);
}

function checkSchedules() {
  const now = new Date();
  const currentDay = now.getDay();
  
  // Use 24-hour format for calculations
  const currentHour = now.getHours(); // 0-23
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`; // 24h format
  const currentMinutesSinceMidnight = (currentHour * 60) + currentMinute;
  
  // For display only
  const displayPeriod = currentHour >= 12 ? 'PM' : 'AM';
  const display12Hour = formatHour(currentHour);
  
  console.log('=== Schedule Check Debug Info ===');
  console.log(`Current time: ${display12Hour}:${currentMinute.toString().padStart(2, '0')} ${displayPeriod} (${currentTime} 24h)`);
  console.log(`Current day: ${currentDay} (0=Sunday, 6=Saturday)`);
  console.log(`Minutes since midnight: ${currentMinutesSinceMidnight}`);
  
  chrome.storage.sync.get('schedules', (data) => {
    const schedules = data.schedules || [];
    
    schedules.forEach(schedule => {
      schedule.days.forEach(day => {
        const dayMap = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        
        if (dayMap[day] === currentDay) {
          schedule.times.forEach(time => {
            // Convert schedule times to 24-hour minutes since midnight for comparison
            const [startHour, startMinute] = time.start.time.split(':').map(Number);
            const [endHour, endMinute] = time.end.time.split(':').map(Number);
            
            const scheduleStart = (startHour * 60) + startMinute;
            const scheduleEnd = (endHour * 60) + endMinute;
            
            console.log('\nTime Check:');
            console.log(`Start time: ${time.start.time}`);
            console.log(`End time: ${time.end.time}`);
            console.log(`Current time: ${currentTime}`);
            console.log(`Should block? ${currentMinutesSinceMidnight >= scheduleStart && currentMinutesSinceMidnight < scheduleEnd && !activeBlock}`);
            
            console.log(`Current minutes since midnight: ${currentMinutesSinceMidnight}`);
            console.log(`Schedule start minutes since midnight: ${scheduleStart}`);
            
            if (currentMinutesSinceMidnight >= scheduleStart && currentMinutesSinceMidnight < scheduleEnd && !activeBlock) {
              console.log('STARTING BLOCK SESSION');
              const remainingMinutes = scheduleEnd - currentMinutesSinceMidnight;
              startScheduledBlock(remainingMinutes, time.start, time.end);
            }
          });
        }
      });
    });
  });
}

function startScheduledBlock(duration, scheduledStart, scheduledEnd) {
  console.log(`Starting scheduled block for ${duration} minutes`);
  
  // Set blocking state
  activeBlock = true;
  endTime = Date.now() + (duration * 60 * 1000);

  // Send message to popup to update UI with scheduled times
  chrome.runtime.sendMessage({
    action: 'startBlocking',
    duration: duration,
    endTime: endTime,
    scheduledStart: {
      time: scheduledStart.time,
      period: scheduledStart.period
    },
    scheduledEnd: {
      time: scheduledEnd.time,
      period: scheduledEnd.period
    }
  });

  // Schedule the end
  scheduleBlockEnd(duration);

  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/icons/icon128.png',
    title: 'LeetMode Activated',
    message: `Scheduled blocking started for ${duration} minutes`
  });
}

// Update the interval to check more frequently
function startScheduleChecker() {
  // Check every 5 seconds to be more precise
  setInterval(checkSchedules, 5000);
  checkSchedules(); // Check immediately
  
  // Also check when system wakes up
  chrome.runtime.onStartup.addListener(checkSchedules);
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

function formatHour(hour) {
  hour = parseInt(hour);
  if (hour === 0) return '12';
  if (hour > 12) return (hour - 12).toString();
  return hour.toString();
}

function convertTo24Hour(hour, period) {
  hour = parseInt(hour);
  if (period === 'PM' && hour !== 12) {
    return hour + 12;
  }
  if (period === 'AM' && hour === 12) {
    return 0;
  }
  return hour % 24; // Ensure hour never exceeds 23
} 