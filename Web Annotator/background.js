// Listener for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ annotations: [] });
});

// Listener for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'remove-recent-highlight') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: removeRecentHighlight
      });
    });
  }
});

// Function to remove the most recent highlight
function removeRecentHighlight() {
  chrome.storage.local.get(['annotations'], (result) => {
    if (result.annotations && result.annotations.length > 0) {
      const annotations = result.annotations;
      const recentAnnotation = annotations.pop();
      chrome.storage.local.set({ annotations });
    }
  });
}


// Listener to execute content.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  }
});

  