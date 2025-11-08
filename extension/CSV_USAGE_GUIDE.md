# CSV Capture Feature - Usage Guide

## Overview

The Synapse Capture extension now includes a powerful CSV-based capture system that allows you to save web page content or selected text to a local CSV file. Data is stored in a stack-like structure (LIFO - Last In, First Out), meaning the most recent captures appear first.

## How It Works

### 1. Quick Save Button

When you open the extension popup, you'll see a prominent **"Quick Save to CSV"** button at the top. Clicking this button will:

1. Open a dialog asking you to choose between:
   - **Save Page**: Saves the entire page content
   - **Save Selected Text**: Saves any text you've highlighted (disabled if no text is selected)

2. After you select an option, the content is saved to the extension's local storage

3. A notification confirms the save was successful

### 2. Data Structure

Each capture is saved with the following information:

| Column | Description |
|--------|-------------|
| **Timestamp** | ISO 8601 format timestamp of when the capture was made |
| **URL** | The webpage URL where the content was captured |
| **Selected Text** | The highlighted text (if "Save Selected Text" was chosen) |
| **Page Content** | The full page content (if "Save Page" was chosen) |
| **Type** | Either "page" or "selected_text" |
| **Title** | The page title or document title |

### 3. Exporting to CSV

Once you have saved captures:

1. An **"Export to CSV"** button appears in the popup, showing how many captures you have saved
2. Click the button to download a CSV file
3. The file is named: `synapse-captures-YYYY-MM-DD.csv`
4. You can open this file in Excel, Google Sheets, or any spreadsheet application

### 4. Stack Behavior (LIFO)

New captures are added to the **beginning** of the list, so:
- Most recent captures appear first in the CSV
- When you export, the newest items are at the top
- This makes it easy to see your latest saves

## Using the Feature

### Method 1: From Extension Popup

1. Click the Synapse extension icon in your browser
2. Click **"Quick Save to CSV"**
3. Choose "Save Page" or "Save Selected Text"
4. Your content is saved!

### Method 2: Select Text First

1. Highlight text on any webpage
2. Click the Synapse extension icon
3. Click **"Quick Save to CSV"**
4. The "Save Selected Text" option will be enabled
5. Choose it to save just the highlighted text

## Tips

- **Before Saving Selected Text**: Always highlight the text you want to save before opening the extension popup
- **Export Regularly**: Export your captures to CSV regularly to back up your data
- **CSV Format**: The CSV uses proper escaping for commas, quotes, and newlines, so it's safe to open in any spreadsheet application
- **Storage**: Data is stored locally in your browser using Chrome's storage API

## Technical Details

- **Storage Location**: Chrome's local storage (chrome.storage.local)
- **Storage Limit**: Depends on Chrome's quota (typically several MB)
- **CSV Encoding**: UTF-8 with proper CSV escaping
- **Date Format**: ISO 8601 (e.g., "2025-01-15T10:30:45.123Z")

## Permissions Required

The extension requires the following permissions to work:
- `storage`: To save captures locally
- `downloads`: To export CSV files
- `activeTab`: To read page content and selected text

---

## Example CSV Output

```csv
Timestamp,URL,Selected Text,Page Content,Type,Title
2025-01-15T10:30:45.123Z,https://example.com,"This is selected text","",selected_text,Example Page
2025-01-15T10:25:30.456Z,https://example.com,"","Full page content here...",page,Example Page
```

Enjoy capturing and organizing your web content!
