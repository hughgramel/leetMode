document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('backButton');
  const startButton = document.getElementById('startLeetMode');
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const incrementButtons = document.querySelectorAll('.increment');
  const decrementButtons = document.querySelectorAll('.decrement');

  backButton.addEventListener('click', () => {
    window.close();
  });

  // Handle increment/decrement buttons
  incrementButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const max = parseInt(input.getAttribute('max'));
      const value = parseInt(input.value);
      input.value = value < max ? value + 1 : value;
    });
  });

  decrementButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const min = parseInt(input.getAttribute('min'));
      const value = parseInt(input.value);
      input.value = value > min ? value - 1 : value;
    });
  });

  // Validate input values
  [hoursInput, minutesInput].forEach(input => {
    input.addEventListener('change', () => {
      const value = parseInt(input.value);
      const min = parseInt(input.getAttribute('min'));
      const max = parseInt(input.getAttribute('max'));
      
      if (isNaN(value) || value < min) {
        input.value = min;
      } else if (value > max) {
        input.value = max;
      }
    });
  });

  startButton.addEventListener('click', () => {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const totalMinutes = (hours * 60) + minutes;

    if (totalMinutes > 0) {
      // Add loading animation
      startButton.classList.add('loading');
      startButton.disabled = true;
      
      chrome.runtime.sendMessage({
        action: 'startBlocking',
        duration: totalMinutes
      }, () => {
        // Wait for animation
        setTimeout(() => {
          // Close the timer page and redirect to LeetCode
          chrome.tabs.create({ url: 'https://leetcode.com' }, () => {
            window.close();
          });
        }, 1000);
      });
    }
  });
}); 