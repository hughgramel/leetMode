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

  // Toggle days dropdown
  daysButton.addEventListener('click', (e) => {
    e.stopPropagation();
    daysDropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!daysButton.contains(e.target) && !daysDropdown.contains(e.target)) {
      daysDropdown.classList.add('hidden');
    }
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
    
    // Reset time ranges
    while (timeRanges.children.length > 1) {
      timeRanges.removeChild(timeRanges.lastChild);
    }
    const firstTimeRange = timeRanges.querySelector('.time-range');
    if (firstTimeRange) {
      firstTimeRange.querySelectorAll('input').forEach(input => input.value = '');
      firstTimeRange.querySelectorAll('.toggle-ampm').forEach(btn => {
        btn.dataset.period = 'AM';
        btn.textContent = 'AM';
      });
    }
    
    updateDaysButtonText();
  }

  function addNewTimeRange() {
    const timeRange = document.createElement('div');
    timeRange.className = 'time-range';
    timeRange.innerHTML = `
      <input type="text" class="time-input" placeholder="00:00" maxlength="5">
      <button class="toggle-ampm" data-period="AM">AM</button>
      <span>to</span>
      <input type="text" class="time-input" placeholder="00:00" maxlength="5">
      <button class="toggle-ampm" data-period="AM">AM</button>
      <button class="remove-time">
        <span class="material-icons">remove_circle_outline</span>
      </button>
    `;

    // Add event listeners
    setupTimeRangeListeners(timeRange);
    timeRanges.appendChild(timeRange);
  }

  function setupTimeRangeListeners(timeRange) {
    // AM/PM toggle
    timeRange.querySelectorAll('.toggle-ampm').forEach(button => {
      button.addEventListener('click', () => {
        toggleAmPm(button);
      });
    });

    // Add click listener to the AM/PM text itself
    timeRange.querySelectorAll('.toggle-ampm').forEach(button => {
      button.style.cursor = 'pointer'; // Ensure cursor shows it's clickable
      button.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAmPm(button);
      });
    });

    function toggleAmPm(button) {
      const currentPeriod = button.dataset.period;
      const newPeriod = currentPeriod === 'AM' ? 'PM' : 'AM';
      button.dataset.period = newPeriod;
      button.textContent = newPeriod;
    }

    // Time input formatting
    timeRange.querySelectorAll('.time-input').forEach(input => {
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
          let hours, minutes;
          
          if (value.length <= 2) {
            // For 1-2 digits, treat as hours only
            hours = parseInt(value);
            if (hours <= 12) {
              e.target.value = value;
            }
          } else {
            // For 3-4 digits, split into hours and minutes
            hours = parseInt(value.substring(0, 2));
            minutes = parseInt(value.substring(2));
            
            if (hours <= 12 && minutes <= 59) {
              e.target.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
          }
        }
      });

      // Format when input loses focus
      input.addEventListener('blur', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
          let hours, minutes;
          
          if (value.length <= 2) {
            // For 1-2 digits, treat as hours and add :00
            hours = parseInt(value);
            if (hours <= 12) {
              e.target.value = `${hours.toString().padStart(2, '0')}:00`;
            }
          } else {
            // For 3+ digits, ensure proper HH:MM format
            hours = parseInt(value.substring(0, 2));
            minutes = parseInt(value.substring(2));
            
            if (hours <= 12 && minutes <= 59) {
              e.target.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
          }
        }
      });
    });

    // Remove button - only show for additional ranges
    const removeButton = timeRange.querySelector('.remove-time');
    if (removeButton && timeRange === timeRange.parentElement.firstElementChild) {
      removeButton.style.display = 'none';
    } else if (removeButton) {
      removeButton.addEventListener('click', () => {
        timeRange.remove();
      });
    }
  }

  function updateDaysButtonText() {
    const selectedDays = Array.from(document.querySelectorAll('.day-option input:checked:not(#everyday)'))
      .map(checkbox => checkbox.id);
    
    const buttonText = daysButton.querySelector('.button-text');
    
    if (document.getElementById('everyday').checked) {
      buttonText.textContent = 'Every day';
    } else if (selectedDays.length === 0) {
      buttonText.textContent = 'Select days';
    } else if (selectedDays.length === 1) {
      // Show full day name for single selection
      buttonText.textContent = selectedDays[0].charAt(0).toUpperCase() + selectedDays[0].slice(1);
    } else {
      // Show abbreviated names for multiple selections
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

    const selectedDays = Array.from(document.querySelectorAll('.day-option input:checked:not(#everyday)'))
      .map(checkbox => checkbox.id);
    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const times = Array.from(timeRanges.querySelectorAll('.time-range'))
      .map(range => {
        const [startInput, endInput] = range.querySelectorAll('.time-input');
        const [startAmPm, endAmPm] = range.querySelectorAll('.toggle-ampm');
        return {
          start: {
            time: startInput.value,
            period: startAmPm.dataset.period
          },
          end: {
            time: endInput.value,
            period: endAmPm.dataset.period
          }
        };
      })
      .filter(time => time.start.time && time.end.time);

    if (times.length === 0) {
      alert('Please add at least one valid time range');
      return;
    }

    const newSchedule = {
      id: Date.now().toString(),
      name,
      days: selectedDays,
      times
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
    const times = schedule.times.map(time => {
      const startTime = `${formatTime(time.start.time)} ${time.start.period}`;
      const endTime = `${formatTime(time.end.time)} ${time.end.period}`;
      return `${startTime} - ${endTime}`;
    }).join(', ');
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

  // Add this after your existing day checkbox event listeners
  const everydayCheckbox = document.getElementById('everyday');
  const dayCheckboxes = document.querySelectorAll('.day-option input[type="checkbox"]:not(#everyday)');

  everydayCheckbox.addEventListener('change', (e) => {
    // Check/uncheck all other day checkboxes
    dayCheckboxes.forEach(checkbox => {
      checkbox.checked = e.target.checked;
    });
    updateDaysButtonText();
  });

  // Update individual day checkbox behavior
  dayCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // If any individual day is unchecked, uncheck "Every day"
      if (!checkbox.checked) {
        everydayCheckbox.checked = false;
      }
      // If all days are checked, check "Every day"
      else if (Array.from(dayCheckboxes).every(cb => cb.checked)) {
        everydayCheckbox.checked = true;
      }
      updateDaysButtonText();
    });
  });
}); 