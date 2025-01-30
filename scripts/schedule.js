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
  const addTimeRange = document.getElementById('addTimeRange');
  const timeRanges = document.getElementById('timeRanges');
  const scheduleName = document.getElementById('scheduleName');

  let currentSchedules = [];
  
  // Initialize days dropdown
  const days = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  // Clear any existing day options
  daysDropdown.innerHTML = '';

  // Create day options
  days.forEach(day => {
    const dayOption = document.createElement('div');
    dayOption.className = 'day-option';
    dayOption.innerHTML = `
      <input type="checkbox" id="${day.id}" value="${day.id}">
      <label for="${day.id}">${day.label}</label>
    `;
    daysDropdown.appendChild(dayOption);
  });

  // Load and display existing schedules
  loadSchedules();

  // Event Listeners
  backButton.addEventListener('click', () => window.close());
  addScheduleButton.addEventListener('click', showModal);
  closeButton.addEventListener('click', hideModal);
  cancelButton.addEventListener('click', hideModal);
  saveButton.addEventListener('click', saveSchedule);

  daysButton.addEventListener('click', () => {
    daysDropdown.classList.toggle('hidden');
    timeDropdown.classList.add('hidden');
  });

  timeButton.addEventListener('click', () => {
    timeDropdown.classList.toggle('hidden');
    daysDropdown.classList.add('hidden');
  });

  // Time type radio buttons
  document.querySelectorAll('input[name="timeType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      timeRanges.classList.toggle('hidden', e.target.value === 'allDay');
      updateTimeButtonText();
    });
  });

  addTimeRange.addEventListener('click', () => {
    addNewTimeRange();
  });

  // Functions
  function showModal() {
    scheduleModal.classList.remove('hidden');
    resetModal();
  }

  function hideModal() {
    scheduleModal.classList.add('hidden');
    resetModal();
  }

  function resetModal() {
    scheduleName.value = '';
    document.querySelectorAll('.day-option input').forEach(checkbox => checkbox.checked = false);
    document.getElementById('allDay').checked = true;
    document.getElementById('customTime').checked = false;
    timeRanges.classList.add('hidden');
    while (timeRanges.children.length > 1) {
      timeRanges.removeChild(timeRanges.lastChild);
    }
    const firstTimeRange = timeRanges.querySelector('.time-range');
    if (firstTimeRange) {
      firstTimeRange.querySelectorAll('input').forEach(input => input.value = '');
    }
    updateTimeButtonText();
    updateDaysButtonText();
  }

  function addNewTimeRange() {
    const timeRange = document.createElement('div');
    timeRange.className = 'time-range';
    timeRange.innerHTML = `
      <input type="text" class="time-input" placeholder="00:00" maxlength="5" pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]">
      <span>to</span>
      <input type="text" class="time-input" placeholder="00:00" maxlength="5" pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]">
      <button class="remove-time">
        <span class="material-icons">remove_circle_outline</span>
      </button>
    `;

    timeRange.querySelector('.remove-time').addEventListener('click', () => {
      timeRange.remove();
      updateTimeButtonText();
    });

    timeRange.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        formatTimeInput(e.target);
      });
      
      input.addEventListener('blur', (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length === 3) {
          e.target.value = `0${value.substring(0, 1)}:${value.substring(1)}`;
        }
      });
    });

    timeRanges.appendChild(timeRange);
  }

  function formatTimeInput(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 4) {
      const hours = parseInt(value.substring(0, 2));
      const minutes = parseInt(value.substring(2, 4));
      
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        input.value = `${value.substring(0, 2)}:${value.substring(2, 4)}`;
      } else {
        input.value = '';
      }
    }
  }

  function updateDaysButtonText() {
    const selectedDays = Array.from(document.querySelectorAll('.day-option input:checked'))
      .map(checkbox => checkbox.id.charAt(0).toUpperCase() + checkbox.id.slice(1, 3));
    
    daysButton.querySelector('.button-text').textContent = 
      selectedDays.length ? selectedDays.join(', ') : 'Select days';
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
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

    const timeType = document.querySelector('input[name="timeType"]:checked').value;
    let times = [];
    
    if (timeType === 'allDay') {
      times = [{ start: '00:00', end: '23:59' }];
    } else {
      times = Array.from(timeRanges.querySelectorAll('.time-range'))
        .map(range => {
          const [start, end] = range.querySelectorAll('input');
          return {
            start: start.value,
            end: end.value
          };
        })
        .filter(time => time.start && time.end);
      
      if (times.length === 0) {
        alert('Please add at least one valid time range');
        return;
      }
    }

    const newSchedule = {
      id: Date.now().toString(),
      name,
      days: selectedDays,
      times,
      timeType
    };

    currentSchedules.push(newSchedule);
    saveSchedulesToStorage();
    renderSchedules();
    hideModal();
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
    const times = schedule.timeType === 'allDay' 
      ? 'All day' 
      : schedule.times.map(time => `${formatTime(time.start)} - ${formatTime(time.end)}`).join(', ');
    return `${days} · ${times}`;
  }

  function deleteSchedule(id) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      currentSchedules = currentSchedules.filter(s => s.id !== id);
      saveSchedulesToStorage();
      renderSchedules();
    }
  }

  // Event listeners for dynamic updates
  document.querySelectorAll('.day-option input').forEach(checkbox => {
    checkbox.addEventListener('change', updateDaysButtonText);
  });

  // Update schedule name input
  const scheduleNameInput = document.getElementById('scheduleName');
  scheduleNameInput.maxLength = 30; // Set max length

  // Remove all day option and simplify time selection
  document.querySelectorAll('.time-option').forEach(option => option.remove());
  timeRanges.classList.remove('hidden');

  // Update validation
  function validateTimeRange(event) {
    const timeRange = event.target.closest('.time-range');
    const [startInput, endInput] = timeRange.querySelectorAll('.time-input');
    
    if (startInput.value && endInput.value) {
      const start = parseInt(startInput.value.replace(':', ''));
      const end = parseInt(endInput.value.replace(':', ''));
      
      if (end <= start) {
        alert('End time must be after start time');
        event.target.value = '';
      }
    }
  }
}); 