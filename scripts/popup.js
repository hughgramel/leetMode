document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const scheduleButton = document.getElementById('scheduleButton');
  const leetModeButton = document.getElementById('leetModeButton');
  const activeSession = document.getElementById('activeSession');
  const timeRemaining = document.getElementById('timeRemaining');
  const stopBlockingButton = document.getElementById('stopBlocking');

  // Check if elements exist before adding listeners
  if (scheduleButton) {
    scheduleButton.addEventListener('click', () => {
      chrome.tabs.create({ url: 'schedule.html' });
    });
  }

  if (leetModeButton) {
    leetModeButton.addEventListener('click', () => {
      chrome.tabs.create({ url: 'leetmode.html' });
    });
  }

  if (stopBlockingButton) {
    stopBlockingButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'stopBlocking' });
      if (activeSession) {
        activeSession.classList.add('hidden');
      }
    });
  }

  // Only check blocking status if we have the necessary elements
  if (activeSession && timeRemaining) {
    checkBlockingStatus();
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