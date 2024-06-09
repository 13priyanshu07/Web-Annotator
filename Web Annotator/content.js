// Function to create a highlight and attach a note
function createHighlight(selectedText, note) {
  let highlight = document.createElement('span');
  highlight.className = 'webpage-annotator-highlight';  
  highlight.title = note; 
  highlight.textContent = selectedText;
  let currentDate = new Date().toLocaleString();
  
  let range = window.getSelection().getRangeAt(0);
  range.deleteContents();  
  range.insertNode(highlight);

  chrome.storage.local.get("highlightColor", (result) => {
    const highlightColor = result.highlightColor || '#ffff00'; // Default color if not found
    highlight.style.backgroundColor = highlightColor; 
    // Save the annotation
    saveAnnotation(window.location.href, selectedText, note, highlightColor, currentDate);
  });
  
  // Add click event to show the note
  highlight.addEventListener('click', () => {
    alert(note);
  });
}

// Function to save annotation to Chrome storage
function saveAnnotation(page, text, note, color, currentDate) {
  chrome.storage.local.get({ annotations: [] }, (result) => {
    let annotations = result.annotations;
    annotations.push({ page: page, text: text, note: note, color: color,Date: currentDate });
    chrome.storage.local.set({ annotations: annotations });
  });
}

// Event listener for mouseup event to highlight selected text
document.addEventListener('mouseup', () => {
  let selectedText = window.getSelection().toString();
  
  if (selectedText) {
    let note = prompt("Add a note(Optional):");  // Prompt to add a note
    if (note !== null) {
      createHighlight(selectedText, note);
    }
  }
});

// Function to load and display annotations when the page is loaded
function loadAnnotations() {
  chrome.storage.local.get({ annotations: [] }, (result) => {
    let annotations = result.annotations.filter(annotation => annotation.page === window.location.href);
    annotations.forEach(annotation => {
      let regex = new RegExp(annotation.text, 'g');
      document.body.innerHTML = document.body.innerHTML.replace(regex, (match) => {
        let highlight = `<span class="webpage-annotator-highlight" title="${annotation.note}" style="background-color: ${annotation.color};">${annotation.text}</span>`;
        return highlight;
      });
    });

    // Add click event listeners to loaded annotations
    document.querySelectorAll('.webpage-annotator-highlight').forEach(element => {
      element.addEventListener('click', () => {
        alert(element.title);
      });
    });
  });
}

// function to export the current page
function exportCurrentPage() {
  let pageHTML = document.documentElement.outerHTML;
  let blob = new Blob([pageHTML], { type: 'text/html' });
  let url = URL.createObjectURL(blob);

  let a = document.createElement('a');
  a.href = url;
  a.download = 'exported_page.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Listen for a message to export the page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportPage') {
    exportCurrentPage();
    sendResponse({ status: 'Page exported' });
  }
});

// Load annotations when the page is loaded
window.addEventListener('load', loadAnnotations);
