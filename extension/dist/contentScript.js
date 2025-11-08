/**
 * Content Script for Synapse Capture Extension
 * Standalone CSV Capture - No backend required
 */

// Import modules
import { PageExtractor } from './pageExtractor.js';

// Create floating save button
let saveButton = null;
let selectedText = '';

// Reading mode summary
let readingModeActive = false;

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length > 0) {
    selectedText = text;
    showSaveButton(selection);
  } else {
    hideSaveButton();
  }
}

function showSaveButton(selection) {
  if (saveButton) {
    hideSaveButton();
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Create button
  saveButton = document.createElement('div');
  saveButton.id = 'synapse-save-button';
  saveButton.innerHTML = `
    <button class="synapse-save-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      Save to Synapse
    </button>
  `;

  // Position button
  const buttonRect = saveButton.getBoundingClientRect();
  const top = rect.top + window.scrollY - buttonRect.height - 8;
  const left = rect.left + window.scrollX + (rect.width / 2) - (buttonRect.width / 2);

  saveButton.style.top = `${Math.max(8, top)}px`;
  saveButton.style.left = `${Math.max(8, left)}px`;

  // Add click handler
  saveButton.querySelector('.synapse-save-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await captureSelection();
    hideSaveButton();
  });

  document.body.appendChild(saveButton);

  // Hide on scroll or click outside
  setTimeout(() => {
    document.addEventListener('scroll', hideSaveButton, { once: true });
    document.addEventListener('click', (e) => {
      if (!saveButton.contains(e.target)) {
        hideSaveButton();
      }
    }, { once: true });
  }, 100);
}

function hideSaveButton() {
  if (saveButton) {
    saveButton.remove();
    saveButton = null;
  }
  selectedText = '';
}

async function captureSelection() {
  if (!selectedText) return;

  const url = window.location.href;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveToCSV',
      data: {
        type: 'selected_text',
        content: selectedText,
        url: url,
        metadata: {
          title: document.title,
        },
      },
    });

    if (response && response.success) {
      showToast('Saved to CSV!');
    } else {
      showToast('Failed to save.');
    }
  } catch (error) {
    console.error('Error capturing selection:', error);
    showToast('Error saving');
  }
}


function showToast(message) {
  const toast = document.createElement('div');
  toast.id = 'synapse-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * Show dialog to ask user if they want to save page or selected text
 */
async function showQuickSaveDialog() {
  return new Promise((resolve) => {
    // Check if there's selected text
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Create dialog overlay
    const dialog = document.createElement('div');
    dialog.id = 'synapse-quick-save-dialog';
    dialog.innerHTML = `
      <div class="synapse-dialog-overlay"></div>
      <div class="synapse-dialog-content">
        <div class="synapse-dialog-header">
          <h2>💾 Quick Save to CSV</h2>
          <button class="synapse-dialog-close">×</button>
        </div>
        <div class="synapse-dialog-body">
          <p style="margin-bottom: 20px; color: #666; font-size: 14px;">What would you like to save?</p>
          <div class="synapse-dialog-buttons">
            <button class="synapse-dialog-btn synapse-btn-page" data-type="page">
              <span class="synapse-btn-icon">📄</span>
              <div>
                <div class="synapse-btn-title">Save Page</div>
                <div class="synapse-btn-desc">Save entire page content</div>
              </div>
            </button>
            <button class="synapse-dialog-btn synapse-btn-selection" data-type="selected_text" ${!selectedText ? 'disabled' : ''}>
              <span class="synapse-btn-icon">✂️</span>
              <div>
                <div class="synapse-btn-title">Save Selected Text</div>
                <div class="synapse-btn-desc">${selectedText ? 'Save highlighted text' : 'No text selected'}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #synapse-quick-save-dialog {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .synapse-dialog-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }
      .synapse-dialog-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        min-width: 400px;
        max-width: 90vw;
        animation: synapse-dialog-slide-in 0.3s ease-out;
      }
      @keyframes synapse-dialog-slide-in {
        from {
          opacity: 0;
          transform: translate(-50%, -45%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
      .synapse-dialog-header {
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .synapse-dialog-header h2 {
        margin: 0;
        font-size: 18px;
        color: #111827;
      }
      .synapse-dialog-close {
        background: none;
        border: none;
        font-size: 28px;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
      }
      .synapse-dialog-close:hover {
        background: #f3f4f6;
        color: #374151;
      }
      .synapse-dialog-body {
        padding: 20px;
      }
      .synapse-dialog-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .synapse-dialog-btn {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }
      .synapse-dialog-btn:hover:not(:disabled) {
        border-color: #7c3aed;
        background: #faf5ff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
      }
      .synapse-dialog-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .synapse-btn-icon {
        font-size: 32px;
        flex-shrink: 0;
      }
      .synapse-btn-title {
        font-weight: 600;
        color: #111827;
        font-size: 15px;
        margin-bottom: 4px;
      }
      .synapse-btn-desc {
        font-size: 13px;
        color: #6b7280;
      }
    `;
    dialog.appendChild(style);

    // Close handler
    const closeDialog = () => {
      dialog.remove();
      resolve({ success: false, cancelled: true });
    };

    // Add event listeners
    dialog.querySelector('.synapse-dialog-close').addEventListener('click', closeDialog);
    dialog.querySelector('.synapse-dialog-overlay').addEventListener('click', closeDialog);

    // Button click handlers
    dialog.querySelectorAll('.synapse-dialog-btn:not(:disabled)').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const type = btn.getAttribute('data-type');
        dialog.remove();

        try {
          let content = '';
          let metadata = {};

          if (type === 'page') {
            // Extract page content
            const pageData = PageExtractor.extract();
            content = pageData.content;
            metadata = {
              title: pageData.title,
              description: pageData.description,
              author: pageData.author,
              wordCount: pageData.wordCount,
            };
          } else if (type === 'selected_text') {
            // Get selected text
            content = selectedText;
            metadata = {
              title: document.title,
            };
          }

          // Save to CSV
          const response = await chrome.runtime.sendMessage({
            action: 'saveToCSV',
            data: {
              type,
              content,
              url: window.location.href,
              metadata,
            },
          });

          if (response && response.success) {
            showToast(`${type === 'page' ? 'Page' : 'Selected text'} saved to CSV!`);
            resolve({ success: true, type });
          } else {
            showToast('Failed to save. Please try again.');
            resolve({ success: false });
          }
        } catch (error) {
          console.error('Error saving:', error);
          showToast('Error saving to CSV');
          resolve({ success: false, error: error.message });
        }
      });
    });

    document.body.appendChild(dialog);
  });
}

// Add message listeners for popup actions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'quickSaveWithDialog') {
    showQuickSaveDialog().then((result) => sendResponse(result));
    return true; // Keep channel open for async response
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  hideSaveButton();
});

