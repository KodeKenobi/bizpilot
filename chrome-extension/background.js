// Background service worker for Trevnoctilla Chrome Extension

// Open Trevnoctilla when extension icon is clicked (fallback if popup fails)
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'https://www.trevnoctilla.com' });
});

// Log installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Trevnoctilla extension installed!');
    // Open welcome page on install
    chrome.tabs.create({ url: 'https://www.trevnoctilla.com?source=chrome_extension' });
  }
});

