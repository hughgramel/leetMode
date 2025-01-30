document.addEventListener('DOMContentLoaded', function() {
  // Get elements with null checks
  const scheduleButton = document.getElementById('scheduleButton');
  const leetModeButton = document.getElementById('leetModeButton');
  const activeSession = document.getElementById('activeSession');
  const timeRemaining = document.getElementById('timeRemaining');
  const stopBlockingButton = document.getElementById('stopBlocking');
  const scheduleDisplay = document.getElementById('scheduleDisplay');

  // Initialize schedule display
  updateNextSession();

  // Check if LeetMode is active when popup opens
  chrome.runtime.sendMessage({ action: 'getBlockingStatus' }, (response) => {
    if (response && response.isBlocking) {
      // Hide the "Go into LeetMode" button if already blocking
      leetModeButton.style.display = 'none';
    } else {
      // Show the button if not blocking
      leetModeButton.style.display = 'flex';
    }
  });

  // Add event listeners only if elements exist
  if (scheduleButton) {
    scheduleButton.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('schedule.html') });
    });
  }

  if (leetModeButton) {
    leetModeButton.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('leetmode.html') });
    });
  }

  if (stopBlockingButton) {
    stopBlockingButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'stopBlocking' }, () => {
        if (activeSession) {
          activeSession.classList.add('hidden');
        }
        // Show the LeetMode button again
        if (leetModeButton) {
          leetModeButton.style.display = 'flex';
        }
      });
    });
  }

  // Check blocking status if elements exist
  if (activeSession && timeRemaining) {
    checkBlockingStatus();
  }

  function updateNextSession() {
    const scheduleDisplay = document.getElementById('scheduleDisplay');
    if (!scheduleDisplay) return;

    chrome.storage.sync.get('schedules', (data) => {
      const schedules = data.schedules || [];
      if (schedules.length > 0) {
        const nextSession = findNextSession(schedules);
        if (nextSession) {
          scheduleDisplay.classList.remove('hidden');
          scheduleDisplay.innerHTML = formatNextSession(nextSession);
        }
      }
    });
  }

  function findNextSession(schedules) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const dayMap = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };

    let nextSession = null;
    let minDiff = Infinity;

    schedules.forEach(schedule => {
      schedule.days.forEach(day => {
        const scheduleDay = dayMap[day];
        let dayDiff = scheduleDay - currentDay;
        if (dayDiff < 0) dayDiff += 7;
        
        schedule.times.forEach(time => {
          const sessionStart = convertToMinutes(time.start.time, time.start.period);
          let totalMinutesDiff = dayDiff * 24 * 60 + (sessionStart - currentTime);
          
          if (totalMinutesDiff > 0 && totalMinutesDiff < minDiff) {
            minDiff = totalMinutesDiff;
            nextSession = {
              ...schedule,
              nextDay: day,
              startTime: time.start,
              endTime: time.end
            };
          }
        });
      });
    });

    return nextSession;
  }

  function convertToMinutes(time, period) {
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + (minutes || 0);
    
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes = minutes || 0;
    
    return totalMinutes;
  }

  function formatNextSession(session) {
    const day = session.nextDay.charAt(0).toUpperCase() + session.nextDay.slice(1);
    return `
      <div class="next-session">
        <span class="material-icons">event_next</span>
        <div>
          <div>Next session:</div>
          <div class="session-time">
            ${day} at ${session.startTime.time} ${session.startTime.period}
          </div>
        </div>
      </div>
    `;
  }

  function checkBlockingStatus() {
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
      if (response && response.active && response.endTime) {
        activeSession.classList.remove('hidden');
        updateTimeRemaining(response.endTime);
        startTimer(response.endTime);
      } else {
        activeSession.classList.add('hidden');
      }
    });
  }

  function updateTimeRemaining(endTime) {
    if (!timeRemaining) return;
    const remaining = Math.max(0, endTime - Date.now());
    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function startTimer(endTime) {
    const timer = setInterval(() => {
      if (Date.now() >= endTime) {
        clearInterval(timer);
        if (activeSession) {
          activeSession.classList.add('hidden');
        }
        return;
      }
      updateTimeRemaining(endTime);
    }, 1000);
  }
}); 