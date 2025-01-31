console.log("Hewwo");

document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('backButton');
  const addScheduleButton = document.getElementById('addScheduleButton');
  const scheduleModal = document.getElementById('scheduleModal');
  const closeButton = document.querySelector('.close-button');
  const cancelButton = document.getElementById('cancelSchedule');
  const saveButton = document.getElementById('saveSchedule');
  const schedulesList = document.getElementById('schedulesList');
  const daysButton = document.getElementById('daysButton');
  const timeButton = document.getElementById('timeButton');
  const daysDropdown = document.getElementById('daysDropdown');
  const timeDropdown = document.getElementById('timeDropdown');
  const timeRanges = document.getElementById('timeRanges');
  const scheduleName = document.getElementById('scheduleName');

  let currentSchedules = [];
  
  const days = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  daysDropdown.innerHTML = '';

  days.forEach(day => {
    const dayOption = document.createElement('div');
    dayOption.className = 'day-option';
    dayOption.innerHTML = `
      <input type="checkbox" id="${day.id}" value="${day.id}">
      <label for="${day.id}">${day.label}</label>
    `;
    daysDropdown.appendChild(dayOption);
  });

  loadSchedules();

  backButton.addEventListener('click', () => window.close());
  addScheduleButton.addEventListener('click', showModal);
  closeButton.addEventListener('click', hideModal);
  cancelButton.addEventListener('click', hideModal);
  saveButton.addEventListener('click', saveSchedule);

  daysButton.addEventListener('click', (e) => {
    e.stopPropagation();
    daysDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!daysButton.contains(e.target) && !daysDropdown.contains(e.target)) {
      daysDropdown.classList.add('hidden');
    }
  });

  document.querySelectorAll('input[name="timeType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      timeRanges.classList.toggle('hidden', e.target.value === 'allDay');
      updateTimeButtonText();
    });
  });

  function showModal() {
    scheduleModal.classList.remove('hidden');
    resetModal();
    
    // Get all time ranges and set up listeners for each
    const timeRanges = document.querySelectorAll('.time-range');
    timeRanges.forEach(timeRange => {
      setupTimeRangeListeners(timeRange);
    });
  }

  function hideModal() {
    scheduleModal.classList.add('hidden');
    resetModal();
  }

  function resetModal() {
    scheduleName.value = '';
    document.querySelectorAll('.day-option input').forEach(checkbox => checkbox.checked = false);
    
    const timeRange = timeRanges.querySelector('.time-range');
    if (timeRange) {
      timeRange.querySelectorAll('select').forEach(select => {
        if (select.classList.contains('hour-select')) {
          select.value = '';
        } else {
          select.value = '00';
        }
      });
      timeRange.querySelectorAll('.toggle-ampm').forEach(btn => {
        btn.dataset.period = 'AM';
        btn.textContent = 'AM';
      });
    }
    
    updateDaysButtonText();
  }

  function setupTimeRangeListeners(timeRange) {
    // Remove any existing listeners first
    const toggleButtons = timeRange.querySelectorAll('.toggle-ampm');
    toggleButtons.forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const newPeriod = this.dataset.period === 'AM' ? 'PM' : 'AM';
        this.textContent = newPeriod;
        this.dataset.period = newPeriod;
        validateTimeRange(timeRange);
      });
    });

    timeRange.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => validateTimeRange(timeRange));
    });

    const removeButton = timeRange.querySelector('.remove-time');
    if (removeButton && timeRange === timeRange.parentElement.firstElementChild) {
      removeButton.style.display = 'none';
    } else if (removeButton) {
      removeButton.addEventListener('click', () => {
        timeRange.remove();
      });
    }
  }

  function validateTimeRange(timeRange) {
    const [startHour, startMinute, endHour, endMinute] = timeRange.querySelectorAll('select');
    const [startAmPm, endAmPm] = timeRange.querySelectorAll('.toggle-ampm');
    
    if (startHour.value && startMinute.value && endHour.value && endMinute.value) {
      if (startHour.value === endHour.value && 
          startMinute.value === endMinute.value && 
          startAmPm.dataset.period === endAmPm.dataset.period) {
        alert('Start and end times cannot be the same');
        endHour.value = '';
        endMinute.value = '00';
        return;
      }
      
      const start = convertToMinutes(
        `${startHour.value}:${startMinute.value}`,
        startAmPm.dataset.period
      );
      const end = convertToMinutes(
        `${endHour.value}:${endMinute.value}`,
        endAmPm.dataset.period
      );
      
      if (end <= start) {
        alert('End time must be after start time');
        endHour.value = '';
        endMinute.value = '00';
      }
    }
  }

  function convertToMinutes(time, period) {
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + (minutes || 0);
    
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes = minutes || 0;
    
    return totalMinutes;
  }

  function updateDaysButtonText() {
    const selectedDays = Array.from(document.querySelectorAll('.day-option input:checked'))
      .map(checkbox => checkbox.id);
    
    const buttonText = daysButton.querySelector('.button-text');
    
    if (selectedDays.length === 0) {
      buttonText.textContent = 'Select days';
    } else if (selectedDays.length === 1) {
      buttonText.textContent = selectedDays[0].charAt(0).toUpperCase() + selectedDays[0].slice(1);
    } else {
      const dayAbbrev = selectedDays.map(day => {
        const firstChar = day.charAt(0).toUpperCase();
        const restChars = day.slice(1, 3);
        return firstChar + restChars;
      });
      buttonText.textContent = dayAbbrev.join(', ');
    }
  }

  function updateTimeButtonText() {
    const timeType = document.querySelector('input[name="timeType"]:checked').value;
    const buttonText = timeButton.querySelector('.button-text');
    
    if (timeType === 'allDay') {
      buttonText.textContent = 'All day long';
    } else {
      const timeRangesText = Array.from(timeRanges.querySelectorAll('.time-range'))
        .map(range => {
          const [start, end] = range.querySelectorAll('input');
          if (start.value && end.value) {
            return `${formatTime(start.value)} - ${formatTime(end.value)}`;
          }
          return null;
        })
        .filter(Boolean)
        .join(', ');
      
      buttonText.textContent = timeRangesText || 'Custom time';
    }
  }

  function formatTime(time) {
    if (!time.includes(':')) return time;
    const [hours, minutes] = time.split(':');
    return `${parseInt(hours)}:${minutes}`;
  }

  function saveSchedule() {
    const name = scheduleName.value.trim();
    if (!name) {
      alert('Please enter a schedule name');
      return;
    }

    const selectedDays = Array.from(document.querySelectorAll('.day-option input:checked'))
      .map(checkbox => checkbox.id);
    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const times = Array.from(timeRanges.querySelectorAll('.time-range'))
      .map(range => {
        const [startHour, startMinute, endHour, endMinute] = range.querySelectorAll('select');
        const [startAmPm, endAmPm] = range.querySelectorAll('.toggle-ampm');
        
        const startHour24 = convertTo24Hour(parseInt(startHour.value), startAmPm.dataset.period);
        const endHour24 = convertTo24Hour(parseInt(endHour.value), endAmPm.dataset.period);
        
        return {
          start: {
            time: `${startHour24.toString().padStart(2, '0')}:${startMinute.value}`,
            period: startAmPm.dataset.period
          },
          end: {
            time: `${endHour24.toString().padStart(2, '0')}:${endMinute.value}`,
            period: endAmPm.dataset.period
          }
        };
      })
      .filter(time => time.start.time.includes(':') && time.end.time.includes(':'));

    if (times.length === 0) {
      alert('Please select valid start and end times');
      return;
    }

    const newSchedule = {
      id: Date.now().toString(),
      name,
      days: selectedDays,
      times
    };

    currentSchedules.push(newSchedule);
    
    const card = createScheduleCard(newSchedule);
    schedulesList.appendChild(card);
    
    saveSchedulesToStorage();
    
    hideModal();
    
    const message = document.createElement('div');
    message.className = 'save-message';
    message.textContent = 'Schedule saved!';
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 2000);
  }

  function convertTo24Hour(hour, period) {
    if (period === 'PM' && hour !== 12) {
      return hour + 12;
    }
    if (period === 'AM' && hour === 12) {
      return 0;
    }
    return hour;
  }

  function loadSchedules() {
    chrome.storage.sync.get('schedules', (data) => {
      currentSchedules = data.schedules || [];
      renderSchedules();
    });
  }

  function saveSchedulesToStorage() {
    chrome.storage.sync.set({ schedules: currentSchedules });
  }

  function renderSchedules() {
    schedulesList.innerHTML = '';
    currentSchedules.forEach(schedule => {
      const card = createScheduleCard(schedule);
      schedulesList.appendChild(card);
    });
  }

  function createScheduleCard(schedule) {
    const card = document.createElement('div');
    card.className = 'schedule-card';
    card.innerHTML = `
      <div class="schedule-icon">
        <span class="material-icons">schedule</span>
      </div>
      <div class="schedule-info">
        <h3 class="schedule-name">${schedule.name}</h3>
        <div class="schedule-time">
          ${formatScheduleTime(schedule)}
        </div>
      </div>
      <button class="icon-button delete-schedule" data-id="${schedule.id}">
        <span class="material-icons">delete_outline</span>
      </button>
    `;

    card.querySelector('.delete-schedule').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSchedule(schedule.id);
    });

    return card;
  }

  function formatScheduleTime(schedule) {
    const days = schedule.days.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ');
    const times = schedule.times.map(time => {
      const [startHour24, startMinutes] = time.start.time.split(':').map(Number);
      const [endHour24, endMinutes] = time.end.time.split(':').map(Number);
      
      const startHour12 = startHour24 > 12 ? startHour24 - 12 : (startHour24 === 0 ? 12 : startHour24);
      const endHour12 = endHour24 > 12 ? endHour24 - 12 : (endHour24 === 0 ? 12 : endHour24);
      
      const startPeriod = startHour24 >= 12 ? 'PM' : 'AM';
      const endPeriod = endHour24 >= 12 ? 'PM' : 'AM';
      
      const startTime = `${startHour12}:${startMinutes.toString().padStart(2, '0')} ${startPeriod}`;
      const endTime = `${endHour12}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
      
      return `${startTime} - ${endTime}`;
    }).join(', ');
    return `${days} - ${times}`;
  }

  function formatHour(hour) {
    hour = parseInt(hour);
    if (hour === 0) return '12';
    if (hour > 12) return (hour - 12).toString();
    return hour.toString();
  }

  function deleteSchedule(id) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      const scheduleToDelete = currentSchedules.find(s => s.id === id);
      if (scheduleToDelete) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const dayMap = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        
        // Check if this schedule is currently active
        const isCurrentlyActive = scheduleToDelete.days.some(day => {
          if (dayMap[day] === currentDay) {
            return scheduleToDelete.times.some(time => {
              const startMinutes = convertToMinutes(time.start.time, time.start.period);
              const endMinutes = convertToMinutes(time.end.time, time.end.period);
              return currentTime >= startMinutes && currentTime < endMinutes;
            });
          }
          return false;
        });
        
        // If this schedule is currently active, stop blocking
        if (isCurrentlyActive) {
          chrome.runtime.sendMessage({ action: 'stopBlocking' });
        }
      }
      
      currentSchedules = currentSchedules.filter(s => s.id !== id);
      saveSchedulesToStorage();
      renderSchedules();
    }
  }

  document.querySelectorAll('.day-option input').forEach(checkbox => {
    checkbox.addEventListener('change', updateDaysButtonText);
  });

  const scheduleNameInput = document.getElementById('scheduleName');
  scheduleNameInput.maxLength = 30;

  document.querySelectorAll('.time-option').forEach(option => option.remove());
  timeRanges.classList.remove('hidden');
}); 