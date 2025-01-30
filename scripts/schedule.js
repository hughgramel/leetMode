document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('backButton');
  const dayCircles = document.querySelectorAll('.day-circle');
  const timeSettings = document.getElementById('timeSettings');
  const saveButton = document.getElementById('saveSchedule');
  const amPmButtons = document.querySelectorAll('.toggle-ampm');

  // Load saved schedule
  loadSchedule();

  backButton.addEventListener('click', () => {
    window.close();
  });

  dayCircles.forEach(circle => {
    circle.addEventListener('click', () => {
      circle.classList.toggle('selected');
      timeSettings.classList.remove('hidden');
    });
  });

  amPmButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.textContent = button.textContent === 'AM' ? 'PM' : 'AM';
    });
  });

  saveButton.addEventListener('click', saveSchedule);

  function loadSchedule() {
    chrome.storage.sync.get('schedule', (data) => {
      if (data.schedule) {
        data.schedule.forEach(item => {
          const dayCircle = document.querySelector(`[data-day="${item.day}"]`);
          if (dayCircle) {
            dayCircle.classList.add('selected');
            // Set times
            const startHour = document.querySelector(`[data-day="${item.day}"] .start-hour`);
            const startMinute = document.querySelector(`[data-day="${item.day}"] .start-minute`);
            if (startHour && startMinute) {
              startHour.value = item.startTime.hour;
              startMinute.value = item.startTime.minute;
            }
          }
        });
      }
    });
  }

  function saveSchedule() {
    const schedule = [];
    dayCircles.forEach(circle => {
      if (circle.classList.contains('selected')) {
        const day = circle.dataset.day;
        const timeGroup = circle.closest('.time-group');
        const startTime = getTimeFromInputs(timeGroup, 'start');
        const endTime = getTimeFromInputs(timeGroup, 'end');
        
        schedule.push({
          day,
          startTime,
          endTime
        });
      }
    });

    chrome.storage.sync.set({ schedule }, () => {
      showSavedMessage();
    });
  }

  function getTimeFromInputs(timeGroup, prefix) {
    const hour = parseInt(timeGroup.querySelector(`.${prefix}-hour`).value);
    const minute = parseInt(timeGroup.querySelector(`.${prefix}-minute`).value);
    const ampm = timeGroup.querySelector(`.${prefix}-ampm`).textContent;
    
    return {
      hour,
      minute,
      ampm
    };
  }

  function showSavedMessage() {
    const message = document.createElement('div');
    message.className = 'save-message';
    message.textContent = 'Schedule saved!';
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 2000);
  }
}); 