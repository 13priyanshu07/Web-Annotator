document.addEventListener('DOMContentLoaded', () => {
  // Initialize elements
  const colorPicker = document.getElementById('color-picker');
  const searchInput = document.getElementById('search-input');
  const exportButton = document.getElementById('export-button');
  const annotationList = document.getElementById('annotation-list');
  const saveColorButton = document.getElementById('save-color');
  const clearButton = document.getElementById('clear-highlight');
  const message = document.getElementById('message');

  //Listen for saveColor
  saveColorButton.addEventListener('click', () => {
    const color = colorPicker.value;
    chrome.storage.local.set({ highlightColor: color });
    message.innerText="Color has been changed.";
  });

  //Listen for clear all Highlights
  clearButton.addEventListener('click', () => {
    const confirmation = confirm("Are you sure you want to Clear All Highlights?");
    if (!confirmation){
      return;
    }
    chrome.storage.local.set({ annotations : []});
    message.innerText="All Highlights cleared!";
  });

  // Listen for Search annotations
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    chrome.storage.local.get({ annotations: [] }, (result) => {
      const filteredAnnotations = result.annotations.filter(annotation =>
        annotation.text.toLowerCase().includes(query) ||
        annotation.note.toLowerCase().includes(query) ||
        annotation.Date.includes(query)
      );
      displayAnnotations(filteredAnnotations);
    });
  });

  // Listen for exportButton 
  exportButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'exportPage' }, (response) => {
        console.log(response.status);
      });
    });
  });

  // Function to display annotations in the popup
  function displayAnnotations(annotations) {
    annotationList.innerHTML = '';
    annotations.forEach(annotation => {
      const listItem = document.createElement('li');
      listItem.textContent = `Text: "${annotation.text}", Note: "${annotation.note}", Color: ${annotation.color}, Date: ${annotation.Date}`;
      annotationList.appendChild(listItem);
    });
  }
});
