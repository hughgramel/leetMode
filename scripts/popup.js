document.addEventListener('DOMContentLoaded', function() {
  // Get elements with null checks
  const scheduleButton = document.getElementById('scheduleButton');
  const leetModeButton = document.getElementById('leetModeButton');
  const activeSession = document.getElementById('activeSession');
  const timeRemaining = document.getElementById('timeRemaining');
  const stopBlockingButton = document.getElementById('stopBlocking');
  const scheduleDisplay = document.getElementById('scheduleDisplay');

  // Initialize schedule display
  updateScheduleDisplay();

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

  function updateScheduleDisplay() {
    if (!scheduleDisplay) return;
    
    chrome.storage.sync.get('schedule', (data) => {
      if (data.schedule && data.schedule.length > 0) {
        const nextSession = findNextSession(data.schedule);
        if (nextSession) {
          scheduleDisplay.classList.remove('hidden');
          scheduleDisplay.innerHTML = formatNextSession(nextSession);
        }
      }
    });
  }

  function findNextSession(schedule) {
    const now = new Date();
    const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const dayMap = { 'Su': 0, 'M': 1, 'T': 2, 'W': 3, 'Th': 4, 'F': 5, 'Sa': 6 };
    
    return schedule
      .map(session => ({
        ...session,
        dayNum: dayMap[session.day],
        startMinutes: convertTimeToMinutes(session.startTime)
      }))
      .sort((a, b) => {
        const dayDiffA = (a.dayNum + 7 - today) % 7;
        const dayDiffB = (b.dayNum + 7 - today) % 7;
        if (dayDiffA === dayDiffB) {
          return a.startMinutes - b.startMinutes;
        }
        return dayDiffA - dayDiffB;
      })[0];
  }

  function convertTimeToMinutes(time) {
    const hour = parseInt(time.hour);
    const minute = parseInt(time.minute);
    const isPM = time.ampm === 'PM';
    return (hour + (isPM && hour !== 12 ? 12 : 0)) * 60 + minute;
  }

  function formatNextSession(session) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `
      <div class="schedule-info">
        <div class="next-session">
          <span class="material-icons">event_next</span>
          <span>Next session:</span>
        </div>
        <div class="session-time">
          ${days[session.dayNum]} at 
          ${formatTime(session.startTime)} - ${formatTime(session.endTime)}
        </div>
      </div>
    `;
  }

  function formatTime(time) {
    return `${time.hour}:${time.minute.toString().padStart(2, '0')} ${time.ampm}`;
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