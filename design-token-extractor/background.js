// Background service worker for Design Token Extractor
// Currently minimal - can be extended for future features

chrome.runtime.onInstalled.addListener(() => {
  console.log("Design Token Extractor installed");
});
