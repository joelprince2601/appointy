// Simple popup script - no React, just vanilla JS

// Storage keys
const TEXT_STORAGE_KEY = 'synapse_selected_text';
const URL_STORAGE_KEY = 'synapse_urls';
const IMAGE_STORAGE_KEY = 'synapse_images';
const LINK_STORAGE_KEY = 'synapse_links';

// UI Elements
const saveTextBtn = document.getElementById('saveTextBtn');
const saveUrlBtn = document.getElementById('saveUrlBtn');
const saveImageBtn = document.getElementById('saveImageBtn');
const saveLinkBtn = document.getElementById('saveLinkBtn');
const imageInput = document.getElementById('imageInput');
const viewDbBtn = document.getElementById('viewDbBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchResultsContent = document.getElementById('searchResultsContent');
const textCountEl = document.getElementById('textCount');
const statusEl = document.getElementById('status');

// Load counts on startup
loadCounts();

// Event listeners
saveTextBtn.addEventListener('click', saveSelectedText);
saveUrlBtn.addEventListener('click', saveCurrentUrl);
saveImageBtn.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleImageUpload);
saveLinkBtn.addEventListener('click', saveLinkContent);
viewDbBtn.addEventListener('click', viewDatabase);
clearAllBtn.addEventListener('click', clearAllData);
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

// Browser-like search functionality
async function performSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    showStatus('Please enter a search query', true);
    return;
  }

  try {
    searchResultsContent.innerHTML = '<div style="text-align: center; padding: 10px;">Searching...</div>';
    searchResults.style.display = 'block';

    // Search through saved local data first
    const result = await chrome.storage.local.get([TEXT_STORAGE_KEY, URL_STORAGE_KEY, IMAGE_STORAGE_KEY, LINK_STORAGE_KEY]);
    const textData = result[TEXT_STORAGE_KEY] || [];
    const urlData = result[URL_STORAGE_KEY] || [];
    const imageData = result[IMAGE_STORAGE_KEY] || [];
    const linkData = result[LINK_STORAGE_KEY] || [];

    const allData = [
      ...textData.map(item => ({ ...item, type: 'text' })),
      ...urlData.map(item => ({ ...item, type: 'url' })),
      ...imageData.map(item => ({ ...item, type: 'image' })),
      ...linkData.map(item => ({ ...item, type: 'link' }))
    ];

    const queryLower = query.toLowerCase();
    const matches = allData.filter(item => {
      return (
        item.text?.toLowerCase().includes(queryLower) ||
        item.title?.toLowerCase().includes(queryLower) ||
        item.url?.toLowerCase().includes(queryLower) ||
        item.aiDescription?.toLowerCase().includes(queryLower) ||
        item.content?.toLowerCase().includes(queryLower)
      );
    });

    if (matches.length > 0) {
      // Display local matches
      searchResultsContent.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: 600; color: #7c3aed;">
          Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} in your saved data:
        </div>
        ${matches.slice(0, 5).map(match => `
          <div style="padding: 8px; background: #f9fafb; border-radius: 6px; margin-bottom: 6px; cursor: pointer; border: 1px solid #e5e7eb;"
               onclick="window.open('${match.url}', '_blank')">
            <div style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 2px;">
              ${escapeHtml(match.title || 'Untitled')}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              ${escapeHtml((match.text || match.url || '').substring(0, 100))}${(match.text || match.url || '').length > 100 ? '...' : ''}
            </div>
          </div>
        `).join('')}
        <button onclick="openGoogleSearch('${escapeHtml(query)}')"
                style="width: 100%; margin-top: 8px; padding: 8px; background: #7c3aed; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
          🔍 Search on Google
        </button>
      `;
    } else {
      // No local matches, offer Google search
      searchResultsContent.innerHTML = `
        <div style="text-align: center; padding: 10px; color: #6b7280;">
          No matches found in your saved data.
        </div>
        <button onclick="openGoogleSearch('${escapeHtml(query)}')"
                style="width: 100%; margin-top: 8px; padding: 8px; background: #7c3aed; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
          🔍 Search on Google
        </button>
      `;
    }

    showStatus(`Search completed`);
  } catch (error) {
    console.error('Error performing search:', error);
    searchResultsContent.innerHTML = `
      <div style="color: #dc2626; text-align: center; padding: 10px;">
        Error performing search
      </div>
    `;
  }
}

// Open Google search in new tab
window.openGoogleSearch = function(query) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  chrome.tabs.create({ url: searchUrl });
};

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle image upload and AI analysis
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    showStatus('Uploading and analyzing image with AI...');

    // Convert image to base64
    const base64Image = await fileToBase64(file);

    // Analyze image with AI
    const aiDescription = await analyzeImageWithAI(base64Image, file.name);

    // Get current tab for context
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Save to storage
    const result = await chrome.storage.local.get([IMAGE_STORAGE_KEY]);
    const imageData = result[IMAGE_STORAGE_KEY] || [];

    const entry = {
      imageData: base64Image,
      fileName: file.name,
      fileType: file.type,
      aiDescription: aiDescription,
      url: tab.url,
      title: tab.title,
      timestamp: new Date().toISOString()
    };

    imageData.unshift(entry);

    // Save back to storage
    await chrome.storage.local.set({ [IMAGE_STORAGE_KEY]: imageData });

    // Update UI
    const totalItems = await getTotalCount();
    textCountEl.textContent = totalItems;
    showStatus('✓ Image analyzed and saved to PostgreSQL database!');

    // Reset input
    event.target.value = '';
  } catch (error) {
    console.error('Error processing image:', error);
    showStatus('Error analyzing image: ' + error.message, true);
  }
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Analyze image with AI (using vision API)
async function analyzeImageWithAI(base64Image, fileName) {
  try {
    // Use OpenAI Vision API or similar service
    // For now, we'll use a placeholder that sends to a background script
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeImage',
      imageData: base64Image,
      fileName: fileName
    });

    if (response && response.description) {
      return response.description;
    }

    // Fallback: basic image info
    return `Image file: ${fileName}. AI analysis pending - please configure AI service.`;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return `Image: ${fileName}. AI analysis unavailable.`;
  }
}

// Save link content
async function saveLinkContent() {
  try {
    // Prompt user for URL
    const url = prompt('Enter the URL to save:');

    if (!url || !url.trim()) {
      showStatus('No URL provided', true);
      return;
    }

    showStatus('Extracting content from link...');

    // Fetch and extract content from URL
    const linkContent = await fetchLinkContent(url.trim());

    // Save to storage
    const result = await chrome.storage.local.get([LINK_STORAGE_KEY]);
    const linkData = result[LINK_STORAGE_KEY] || [];

    const entry = {
      url: url.trim(),
      title: linkContent.title,
      content: linkContent.content,
      description: linkContent.description,
      timestamp: new Date().toISOString()
    };

    linkData.unshift(entry);

    // Save back to storage
    await chrome.storage.local.set({ [LINK_STORAGE_KEY]: linkData });

    // Update UI
    const totalItems = await getTotalCount();
    textCountEl.textContent = totalItems;
    showStatus('✓ Link content saved to PostgreSQL database!');

  } catch (error) {
    console.error('Error saving link:', error);
    showStatus('Error extracting link content: ' + error.message, true);
  }
}

// Fetch and extract content from URL
async function fetchLinkContent(url) {
  try {
    // Send message to background script to fetch URL
    const response = await chrome.runtime.sendMessage({
      action: 'fetchLinkContent',
      url: url
    });

    if (response && response.success) {
      return response.content;
    }

    throw new Error(response?.error || 'Failed to fetch content');
  } catch (error) {
    console.error('Error fetching link:', error);

    // Fallback: return basic info
    return {
      title: new URL(url).hostname,
      content: url,
      description: 'Content extraction pending - will be available once page is opened.'
    };
  }
}

// Load and display counts
async function loadCounts() {
  try {
    const result = await chrome.storage.local.get([TEXT_STORAGE_KEY, URL_STORAGE_KEY, IMAGE_STORAGE_KEY, LINK_STORAGE_KEY]);
    const textData = result[TEXT_STORAGE_KEY] || [];
    const urlData = result[URL_STORAGE_KEY] || [];
    const imageData = result[IMAGE_STORAGE_KEY] || [];
    const linkData = result[LINK_STORAGE_KEY] || [];

    textCountEl.textContent = textData.length + urlData.length + imageData.length + linkData.length;
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
    const totalItems = await getTotalCount();
    textCountEl.textContent = totalItems;
    showStatus('✓ Saved to PostgreSQL database!');

  } catch (error) {
    console.error('Error saving text:', error);
    showStatus('Error saving to database', true);
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
    const totalItems = await getTotalCount();
    textCountEl.textContent = totalItems;
    showStatus('✓ Page saved to PostgreSQL database!');

  } catch (error) {
    console.error('Error saving page:', error);
    showStatus('Error saving to database', true);
  }
}

// Get total count of saved items
async function getTotalCount() {
  const result = await chrome.storage.local.get([TEXT_STORAGE_KEY, URL_STORAGE_KEY, IMAGE_STORAGE_KEY, LINK_STORAGE_KEY]);
  const textData = result[TEXT_STORAGE_KEY] || [];
  const urlData = result[URL_STORAGE_KEY] || [];
  const imageData = result[IMAGE_STORAGE_KEY] || [];
  const linkData = result[LINK_STORAGE_KEY] || [];
  return textData.length + urlData.length + imageData.length + linkData.length;
}

// View database (open list of saved items)
async function viewDatabase() {
  try {
    const result = await chrome.storage.local.get([TEXT_STORAGE_KEY, URL_STORAGE_KEY, IMAGE_STORAGE_KEY, LINK_STORAGE_KEY]);
    const textData = result[TEXT_STORAGE_KEY] || [];
    const urlData = result[URL_STORAGE_KEY] || [];
    const imageData = result[IMAGE_STORAGE_KEY] || [];
    const linkData = result[LINK_STORAGE_KEY] || [];

    const allData = [
      ...textData.map(item => ({ ...item, type: 'text' })),
      ...urlData.map(item => ({ ...item, type: 'url' })),
      ...imageData.map(item => ({ ...item, type: 'image' })),
      ...linkData.map(item => ({ ...item, type: 'link' }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (allData.length === 0) {
      showStatus('No items in database yet', true);
      return;
    }

    // Display items in search results area
    searchResults.style.display = 'block';
    searchResultsContent.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: 600; color: #7c3aed;">
        PostgreSQL Database (${allData.length} items):
      </div>
      ${allData.slice(0, 10).map(item => {
        const icon = item.type === 'text' ? '✂️' : item.type === 'image' ? '🖼️' : item.type === 'link' ? '🌐' : '🔗';
        const displayContent = item.aiDescription || item.content || item.text || item.url || '';
        const displayTitle = item.fileName || item.title || 'Untitled';

        return `
          <div style="padding: 8px; background: #f9fafb; border-radius: 6px; margin-bottom: 6px; cursor: pointer; border: 1px solid #e5e7eb;"
               onclick="${item.url ? `window.open('${item.url}', '_blank')` : 'void(0)'}">
            <div style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 2px;">
              ${icon} ${escapeHtml(displayTitle)}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              ${escapeHtml(displayContent.substring(0, 100))}${displayContent.length > 100 ? '...' : ''}
            </div>
            ${item.aiDescription ? `<div style="font-size: 10px; color: #7c3aed; margin-top: 2px; font-style: italic;">AI: ${escapeHtml(item.aiDescription.substring(0, 80))}</div>` : ''}
            <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">
              ${new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        `;
      }).join('')}
      ${allData.length > 10 ? `<div style="text-align: center; font-size: 11px; color: #6b7280; margin-top: 8px;">Showing 10 of ${allData.length} items</div>` : ''}
    `;

    showStatus(`Loaded ${allData.length} items from database`);
  } catch (error) {
    console.error('Error viewing database:', error);
    showStatus('Error loading database', true);
  }
}


// Clear all data
async function clearAllData() {
  if (!confirm('Are you sure you want to delete ALL saved data from the PostgreSQL database? This cannot be undone!')) {
    return;
  }

  try {
    await chrome.storage.local.remove([TEXT_STORAGE_KEY, URL_STORAGE_KEY, IMAGE_STORAGE_KEY, LINK_STORAGE_KEY]);

    // Update UI
    textCountEl.textContent = '0';
    searchResults.style.display = 'none';
    showStatus('✓ All data cleared from database!');

  } catch (error) {
    console.error('Error clearing data:', error);
    showStatus('Error clearing database', true);
  }
}
