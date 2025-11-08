/**
 * Background Service Worker for Synapse Capture Extension
 * Saves directly to PostgreSQL database via API
 */

import { DatabaseStorage } from './databaseStorage.js';

const databaseStorage = new DatabaseStorage();

// Get API base URL
async function getApiBase() {
  await databaseStorage.loadConfig();
  return databaseStorage.getApiBase();
}

// Install: Set up context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'synapse-quick-save',
    title: 'Quick Save to Synapse',
    contexts: ['all'],
  });

  chrome.contextMenus.create({
    id: 'synapse-capture-text',
    title: 'Save Selected Text to Synapse',
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
      await saveToDatabase({
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
  if (request.action === 'saveToDatabase' || request.action === 'saveToCSV') {
    saveToDatabase(request.data)
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'getAuthToken') {
    databaseStorage.getAuthToken()
      .then((token) => sendResponse({ token }))
      .catch(() => sendResponse({ token: null }));
    return true;
  }

  if (request.action === 'getUserId') {
    databaseStorage.getAuthToken()
      .then((token) => databaseStorage.getUserId(token))
      .then((userId) => sendResponse({ userId }))
      .catch(() => sendResponse({ userId: null }));
    return true;
  }

  if (request.action === 'updateConfig') {
    databaseStorage.updateConfig(request.apiBase)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Save content to database via API
 */
async function saveToDatabase(data) {
  try {
    // Get user ID from token
    const token = await databaseStorage.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated. Please log in to the web app first.');
    }

    const userId = await databaseStorage.getUserId(token);
    if (!userId) {
      throw new Error('Could not get user ID. Please log in again.');
    }

    // Prepare memory data
    const memoryData = {
      title: data.metadata?.title || data.url || 'Untitled',
      content: data.content || '',
      type: data.type === 'page' ? 'article' : 'note',
      url: data.url || '',
      metadata: data.metadata || {},
      userId: userId,
    };

    // Get API base URL
    const apiBase = await getApiBase();
    
    // Save via API
    const response = await fetch(`${apiBase}/save-memory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(memoryData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to save: ${response.statusText}`);
    }

    const result = await response.json();

    // Show success notification
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Synapse Capture',
        message: `${data.type === 'page' ? 'Page' : 'Selected text'} saved to database!`,
      });
    } catch (error) {
      console.log('Notification error:', error);
    }

    return { memory: result.memory };
  } catch (error) {
    console.error('Error saving to database:', error);
    
    // Show error notification
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Synapse Capture',
        message: `Error: ${error.message}`,
      });
    } catch (notifError) {
      console.log('Notification error:', notifError);
    }
    
    throw error;
  }
}

