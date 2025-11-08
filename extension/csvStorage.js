/**
 * CSV Storage Manager for Synapse Capture Extension
 * Handles saving captures to CSV format with separate columns
 */

const CSV_STORE_NAME = 'synapse-captures';

export class CSVStorage {
  constructor() {
    this.captures = [];
    this.loadFromStorage();
  }

  /**
   * Load existing captures from chrome.storage.local
   */
  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get([CSV_STORE_NAME]);
      this.captures = result[CSV_STORE_NAME] || [];
    } catch (error) {
      console.error('Error loading captures:', error);
      this.captures = [];
    }
  }

  /**
   * Save a new capture with page or selected text
   * @param {Object} data - { type: 'page' | 'selected_text', content, url, metadata }
   */
  async addCapture(data) {
    const capture = {
      timestamp: new Date().toISOString(),
      url: data.url || '',
      selected_text: data.type === 'selected_text' ? data.content : '',
      page_content: data.type === 'page' ? data.content : '',
      type: data.type,
      title: data.metadata?.title || '',
      ...data.metadata,
    };

    // Add to the beginning of the array (stack behavior - LIFO)
    this.captures.unshift(capture);

    // Save to chrome.storage.local
    await this.saveToStorage();

    return capture;
  }

  /**
   * Save captures to chrome.storage.local
   */
  async saveToStorage() {
    try {
      await chrome.storage.local.set({
        [CSV_STORE_NAME]: this.captures,
      });
    } catch (error) {
      console.error('Error saving captures:', error);
      throw error;
    }
  }

  /**
   * Get all captures
   */
  async getAllCaptures() {
    await this.loadFromStorage();
    return this.captures;
  }

  /**
   * Export captures to CSV file
   */
  async exportToCSV() {
    await this.loadFromStorage();

    if (this.captures.length === 0) {
      throw new Error('No captures to export');
    }

    // CSV headers
    const headers = ['Timestamp', 'URL', 'Selected Text', 'Page Content', 'Type', 'Title'];

    // Convert captures to CSV rows
    const rows = this.captures.map((capture) => [
      capture.timestamp,
      capture.url,
      this.escapeCSV(capture.selected_text || ''),
      this.escapeCSV(capture.page_content || ''),
      capture.type,
      this.escapeCSV(capture.title || ''),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `synapse-captures-${new Date().toISOString().split('T')[0]}.csv`;

    // Trigger download
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true,
    });

    return { success: true, filename };
  }

  /**
   * Escape CSV special characters
   */
  escapeCSV(value) {
    if (!value) return '';

    const stringValue = String(value);

    // If the value contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Clear all captures
   */
  async clearCaptures() {
    this.captures = [];
    await chrome.storage.local.remove([CSV_STORE_NAME]);
  }

  /**
   * Get capture count
   */
  async getCount() {
    await this.loadFromStorage();
    return this.captures.length;
  }
}
