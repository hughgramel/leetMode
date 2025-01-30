document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('backButton');
  const startButton = document.getElementById('startLeetMode');
  const hourInput = document.querySelector('.time-unit:nth-child(1) input');
  const minuteInput = document.querySelector('.time-unit:nth-child(2) input');
  const incrementButtons = document.querySelectorAll('.increment');
  const decrementButtons = document.querySelectorAll('.decrement');

  backButton.addEventListener('click', () => {
    window.close();
  });

  // Allow typing in inputs
  [hourInput, minuteInput].forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value;
      
      // Remove any non-numeric characters
      value = value.replace(/[^0-9]/g, '');
      
      // Convert to number
      const numValue = parseInt(value, 10);
      const max = input === hourInput ? 23 : 59;
      
      // Handle empty or invalid input
      if (value === '' || isNaN(numValue)) {
        input.value = '0';
      }
      // Handle numbers exceeding max
      else if (numValue > max) {
        input.value = max;
      }
      // Handle valid numbers, ensuring leading zero for single digits
      else {
        input.value = numValue.toString();
      }
    });

    // Add leading zero when input loses focus
    input.addEventListener('blur', (e) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value < 10) {
        e.target.value = value.toString().padStart(2, '0');
      }
    });
  });

  // Update increment/decrement to handle leading zeros
  incrementButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const input = index === 0 ? hourInput : minuteInput;
      const max = index === 0 ? 23 : 59;
      const currentValue = parseInt(input.value, 10) || 0;
      const newValue = Math.min(currentValue + 1, max);
      input.value = newValue.toString().padStart(2, '0');
    });
  });

  decrementButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const input = index === 0 ? hourInput : minuteInput;
      const currentValue = parseInt(input.value, 10) || 0;
      const newValue = Math.max(currentValue - 1, 0);
      input.value = newValue.toString().padStart(2, '0');
    });
  });

  startButton.addEventListener('click', () => {
    const hours = parseInt(hourInput.value);
    const minutes = parseInt(minuteInput.value);
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes > 0) {
      startTimer(totalMinutes);
    } else {
      alert('Please set a valid duration.');
    }
  });

  function startTimer(duration) {
    // Add loading animation
    startButton.classList.add('loading');
    startButton.disabled = true;
    
    chrome.runtime.sendMessage({
      action: 'startBlocking',
      duration: duration
    }, () => {
      // Immediately redirect to LeetCode and close
      chrome.tabs.create({ url: 'https://leetcode.com' }, () => {
        window.close();
      });
    });
  }
});