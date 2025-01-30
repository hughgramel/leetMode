document.addEventListener('DOMContentLoaded', function() {
  // Your extension logic goes here
  console.log('Extension popup loaded!');

  // Get the button element
  const openNewTabButton = document.getElementById('openNewTab');
  
  // Add click event listener
  openNewTabButton.addEventListener('click', function() {
    // Get the extension's URL and open newtab.html
    chrome.tabs.create({
      url: chrome.runtime.getURL('newtab.html')
    });
  });
}); 