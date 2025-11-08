/**
 * Background Service Worker for Synapse Capture Extension
 * Standalone CSV capture - no backend required
 */

import { CSVStorage } from './csvStorage.js';

const csvStorage = new CSVStorage();

// Install: Set up context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'synapse-quick-save',
    title: 'Quick Save to CSV',
    contexts: ['all'],
  });

  chrome.contextMenus.create({
    id: 'synapse-capture-text',
    title: 'Save Selected Text to CSV',
    contexts: ['selection'],
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === 'synapse-quick-save') {
      // Open the dialog
      await chrome.tabs.sendMessage(tab.id, { action: 'quickSaveWithDialog' });
    } else if (info.menuItemId === 'synapse-capture-text') {
      // Save selected text directly
      const content = info.selectionText;
      await saveToCSV({
        type: 'selected_text',
        content: content,
        url: tab.url,
        metadata: {
          title: tab.title,
        },
      });
    }
  } catch (error) {
    console.error('Error handling context menu:', error);
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Synapse Capture',
        message: 'Failed to save. Please try again.',
      });
    } catch (error) {
      console.log('Notification error:', error);
    }
  }
});

// Message handler from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToCSV') {
    saveToCSV(request.data)
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'exportCSV') {
    exportCSV()
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'getCaptureCount') {
    csvStorage.getCount()
      .then((count) => sendResponse({ count }))
      .catch(() => sendResponse({ count: 0 }));
    return true;
  }

  if (request.action === 'getAllCaptures') {
    csvStorage.getAllCaptures()
      .then((captures) => sendResponse({ captures }))
      .catch(() => sendResponse({ captures: [] }));
    return true;
  }

  if (request.action === 'clearCaptures') {
    csvStorage.clearCaptures()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Save content to CSV storage (standalone - no backend required)
 */
async function saveToCSV(data) {
  try {
    const capture = await csvStorage.addCapture(data);

    // Show success notification
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Synapse Capture',
        message: `${data.type === 'page' ? 'Page' : 'Selected text'} saved to CSV!`,
      });
    } catch (error) {
      console.log('Notification error:', error);
    }

    return { capture };
  } catch (error) {
    console.error('Error saving to CSV:', error);
    throw error;
  }
}

/**
 * Export all captures to CSV file
 */
async function exportCSV() {
  try {
    const result = await csvStorage.exportToCSV();

    // Show success notification
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Synapse Capture',
        message: `CSV exported: ${result.filename}`,
      });
    } catch (error) {
      console.log('Notification error:', error);
    }

    return result;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}

