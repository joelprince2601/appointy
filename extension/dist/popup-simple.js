// Simple popup script - no React, just vanilla JS

// Storage keys
const TEXT_STORAGE_KEY = 'synapse_selected_text';
const URL_STORAGE_KEY = 'synapse_urls';

// UI Elements
const saveTextBtn = document.getElementById('saveTextBtn');
const saveUrlBtn = document.getElementById('saveUrlBtn');
const exportTextBtn = document.getElementById('exportTextBtn');
const exportUrlBtn = document.getElementById('exportUrlBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const textCountEl = document.getElementById('textCount');
const urlCountEl = document.getElementById('urlCount');
const statusEl = document.getElementById('status');

// Load counts on startup
loadCounts();

// Event listeners
saveTextBtn.addEventListener('click', saveSelectedText);
saveUrlBtn.addEventListener('click', saveCurrentUrl);
exportTextBtn.addEventListener('click', exportTextCSV);
exportUrlBtn.addEventListener('click', exportUrlCSV);
clearAllBtn.addEventListener('click', clearAllData);

// Load and display counts
async function loadCounts() {
  try {
    const result = await chrome.storage.local.get([TEXT_STORAGE_KEY, URL_STORAGE_KEY]);
    const textData = result[TEXT_STORAGE_KEY] || [];
    const urlData = result[URL_STORAGE_KEY] || [];

    textCountEl.textContent = textData.length;
    urlCountEl.textContent = urlData.length;
  } catch (error) {
    console.error('Error loading counts:', error);
  }
}

// Show status message
function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'status status-error' : 'status status-success';

  setTimeout(() => {
    statusEl.className = 'status status-hidden';
  }, 3000);
}

// Save selected text
async function saveSelectedText() {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Execute script to get selected text
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString()
    });

    const selectedText = results[0].result;

    if (!selectedText || selectedText.trim().length === 0) {
      showStatus('No text selected!', true);
      return;
    }

    // Get existing data
    const result = await chrome.storage.local.get([TEXT_STORAGE_KEY]);
    const textData = result[TEXT_STORAGE_KEY] || [];

    // Add new entry (append to beginning - stack behavior)
    const entry = {
      text: selectedText.trim(),
      url: tab.url,
      title: tab.title,
      timestamp: new Date().toISOString()
    };

    textData.unshift(entry); // Add to beginning

    // Save back to storage
    await chrome.storage.local.set({ [TEXT_STORAGE_KEY]: textData });

    // Update UI
    textCountEl.textContent = textData.length;
    showStatus(`Saved! (${textData.length} total)`);

  } catch (error) {
    console.error('Error saving text:', error);
    showStatus('Error saving text', true);
  }
}

// Save current URL
async function saveCurrentUrl() {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Get existing data
    const result = await chrome.storage.local.get([URL_STORAGE_KEY]);
    const urlData = result[URL_STORAGE_KEY] || [];

    // Add new entry (append to beginning - stack behavior)
    const entry = {
      url: tab.url,
      title: tab.title,
      timestamp: new Date().toISOString()
    };

    urlData.unshift(entry); // Add to beginning

    // Save back to storage
    await chrome.storage.local.set({ [URL_STORAGE_KEY]: urlData });

    // Update UI
    urlCountEl.textContent = urlData.length;
    showStatus(`URL saved! (${urlData.length} total)`);

  } catch (error) {
    console.error('Error saving URL:', error);
    showStatus('Error saving URL', true);
  }
}

// Export selected text to CSV
async function exportTextCSV() {
  try {
    const result = await chrome.storage.local.get([TEXT_STORAGE_KEY]);
    const textData = result[TEXT_STORAGE_KEY] || [];

    if (textData.length === 0) {
      showStatus('No text to export!', true);
      return;
    }

    // Create CSV content
    const headers = ['Timestamp', 'Selected Text', 'Page Title', 'URL'];
    const rows = textData.map(entry => [
      entry.timestamp,
      escapeCSV(entry.text),
      escapeCSV(entry.title),
      escapeCSV(entry.url)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `selected-text-${new Date().toISOString().split('T')[0]}.csv`;

    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    showStatus(`Exported ${textData.length} items!`);

  } catch (error) {
    console.error('Error exporting text CSV:', error);
    showStatus('Error exporting CSV', true);
  }
}

// Export URLs to CSV
async function exportUrlCSV() {
  try {
    const result = await chrome.storage.local.get([URL_STORAGE_KEY]);
    const urlData = result[URL_STORAGE_KEY] || [];

    if (urlData.length === 0) {
      showStatus('No URLs to export!', true);
      return;
    }

    // Create CSV content
    const headers = ['Timestamp', 'URL', 'Page Title'];
    const rows = urlData.map(entry => [
      entry.timestamp,
      escapeCSV(entry.url),
      escapeCSV(entry.title)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `urls-${new Date().toISOString().split('T')[0]}.csv`;

    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    showStatus(`Exported ${urlData.length} URLs!`);

  } catch (error) {
    console.error('Error exporting URL CSV:', error);
    showStatus('Error exporting CSV', true);
  }
}

// Clear all data
async function clearAllData() {
  if (!confirm('Are you sure you want to delete ALL saved data? This cannot be undone!')) {
    return;
  }

  try {
    await chrome.storage.local.remove([TEXT_STORAGE_KEY, URL_STORAGE_KEY]);

    // Update UI
    textCountEl.textContent = '0';
    urlCountEl.textContent = '0';
    showStatus('All data cleared!');

  } catch (error) {
    console.error('Error clearing data:', error);
    showStatus('Error clearing data', true);
  }
}

// Escape CSV special characters
function escapeCSV(value) {
  if (!value) return '';

  const stringValue = String(value);

  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}
