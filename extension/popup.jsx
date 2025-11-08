/**
 * Popup UI for Synapse Capture Extension
 * Standalone - No backend required
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function Popup() {
  const [recentCaptures, setRecentCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCaptures, setFilteredCaptures] = useState([]);
  const [activeTab, setActiveTab] = useState('actions'); // 'actions' or 'captures'
  const [actionStatus, setActionStatus] = useState({ type: null, message: null });
  const [captureCount, setCaptureCount] = useState(0);

  useEffect(() => {
    loadCaptures();
  }, []);

  useEffect(() => {
    // Filter captures based on search query
    if (searchQuery.trim()) {
      const filtered = recentCaptures.filter((capture) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          capture.title?.toLowerCase().includes(searchLower) ||
          capture.url?.toLowerCase().includes(searchLower) ||
          capture.selected_text?.toLowerCase().includes(searchLower) ||
          capture.page_content?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredCaptures(filtered);
    } else {
      setFilteredCaptures(recentCaptures);
    }
  }, [searchQuery, recentCaptures]);

  const loadCaptures = async () => {
    try {
      setLoading(true);

      // Get all captures from storage
      const response = await chrome.runtime.sendMessage({
        action: 'getAllCaptures',
      });

      if (response && response.captures) {
        setRecentCaptures(response.captures.slice(0, 20)); // Show last 20
        setCaptureCount(response.captures.length);
      }
    } catch (error) {
      console.error('Error loading captures:', error);
      setRecentCaptures([]);
      setCaptureCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('captures');
    }
  };

  const handleAction = async (actionType) => {
    try {
      setActionStatus({ type: actionType, message: 'Processing...' });

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: actionType,
      });

      if (response && response.success) {
        setActionStatus({ type: actionType, message: 'Success!' });
        setTimeout(() => {
          setActionStatus({ type: null, message: null });
          loadCaptures(); // Reload captures after saving
        }, 1000);
      } else {
        setActionStatus({ type: actionType, message: 'Failed. Try again.' });
        setTimeout(() => setActionStatus({ type: null, message: null }), 2000);
      }
    } catch (error) {
      console.error(`Error executing ${actionType}:`, error);
      setActionStatus({ type: actionType, message: 'Error. Check console.' });
      setTimeout(() => setActionStatus({ type: null, message: null }), 2000);
    }
  };

  const openUrl = (url) => {
    if (url) {
      chrome.tabs.create({ url });
    }
  };

  const handleClearCaptures = async () => {
    if (!confirm('Are you sure you want to clear all captures? This cannot be undone.')) {
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'clearCaptures',
      });

      if (response && response.success) {
        loadCaptures();
      }
    } catch (error) {
      console.error('Error clearing captures:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      setActionStatus({ type: 'export', message: 'Exporting...' });

      const response = await chrome.runtime.sendMessage({
        action: 'exportCSV',
      });

      if (response && response.success) {
        setActionStatus({ type: 'export', message: 'Exported!' });
        setTimeout(() => setActionStatus({ type: null, message: null }), 2000);
      } else {
        setActionStatus({ type: 'export', message: 'Failed to export' });
        setTimeout(() => setActionStatus({ type: null, message: null }), 2000);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setActionStatus({ type: 'export', message: 'Error' });
      setTimeout(() => setActionStatus({ type: null, message: null }), 2000);
    }
  };

  return (
    <div className="w-[400px] min-h-[600px] bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </div>
          <h1 className="text-lg font-bold">Synapse Capture</h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in Synapse..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg border border-white/30 disabled:opacity-50 text-sm font-medium"
            >
              {searching ? '...' : '🔍'}
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'actions'
                ? 'bg-white/30 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Actions
          </button>
          <button
            onClick={() => setActiveTab('captures')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'captures'
                ? 'bg-white/30 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Captures ({captureCount})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'actions' ? (
          <>
            {/* Action Buttons */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>

              {/* Quick Save with Dialog */}
              <button
                onClick={() => handleAction('quickSaveWithDialog')}
                disabled={actionStatus.type === 'quickSaveWithDialog'}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-3 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💾</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white text-sm">Quick Save to CSV</div>
                  <div className="text-xs text-white/80">Save page or selected text</div>
                </div>
                {actionStatus.type === 'quickSaveWithDialog' && (
                  <div className="text-xs text-white">{actionStatus.message}</div>
                )}
              </button>

              {/* Export CSV Button */}
              {captureCount > 0 && (
                <button
                  onClick={handleExportCSV}
                  disabled={actionStatus.type === 'export'}
                  className="w-full px-4 py-3 bg-white rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all shadow-sm flex items-center gap-3 disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📥</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 text-sm">Export to CSV</div>
                    <div className="text-xs text-gray-500">{captureCount} capture{captureCount !== 1 ? 's' : ''} saved</div>
                  </div>
                  {actionStatus.type === 'export' && (
                    <div className="text-xs text-green-600">{actionStatus.message}</div>
                  )}
                </button>
              )}

              {/* Clear Captures Button */}
              {captureCount > 0 && (
                <button
                  onClick={handleClearCaptures}
                  className="w-full px-4 py-3 bg-white rounded-lg border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all shadow-sm flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🗑️</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 text-sm">Clear All Captures</div>
                    <div className="text-xs text-gray-500">Delete all saved captures</div>
                  </div>
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-purple-900 leading-relaxed">
                <strong>💡 Tip:</strong> Use the Quick Save button to choose between saving the full page or just selected text. All captures are stored locally and can be exported to CSV.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Captures List */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-700">
                {searchQuery ? `Search Results (${filteredCaptures.length})` : `Your Captures (${captureCount})`}
              </h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
              ) : filteredCaptures.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <div className="text-4xl mb-2">📝</div>
                  <div>{searchQuery ? 'No matches found' : 'No captures yet'}</div>
                  <div className="text-xs mt-1">{searchQuery ? 'Try a different search' : 'Start saving content!'}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCaptures.map((capture, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                      onClick={() => openUrl(capture.url)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">
                            {capture.type === 'page' ? '📄' : '✂️'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {capture.title || 'Untitled'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {capture.type === 'page'
                              ? (capture.page_content?.substring(0, 100) || 'No content')
                              : (capture.selected_text?.substring(0, 100) || 'No content')}
                            {(capture.page_content?.length > 100 || capture.selected_text?.length > 100) && '...'}
                          </div>
                          {capture.url && (
                            <div className="text-xs text-gray-400 mt-1 truncate">
                              {new URL(capture.url).hostname}
                            </div>
                          )}
                          {capture.timestamp && (
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(capture.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Initialize React app
console.log('Initializing React app...');
const container = document.getElementById('root');
if (container) {
  try {
    console.log('Container found, creating root...');
    const root = createRoot(container);
    console.log('Root created, rendering Popup component...');
    root.render(<Popup />);
    console.log('Popup component rendered successfully!');
  } catch (error) {
    console.error('Error initializing React app:', error);
    console.error('Error stack:', error.stack);
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #dc2626; background: #fff; min-height: 500px;">
        <h2 style="margin-bottom: 10px; color: #dc2626;">Error Loading Extension</h2>
        <p style="color: #666; font-size: 14px;">${error.message}</p>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">Check the console for details.</p>
        <pre style="text-align: left; background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 11px; margin-top: 10px; overflow: auto;">${error.stack}</pre>
      </div>
    `;
  }
} else {
  console.error('Root container not found');
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #dc2626;">
      <h2>Error: Root container not found</h2>
      <p>Check the console for details.</p>
    </div>
  `;
}
