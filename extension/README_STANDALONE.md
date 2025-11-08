# Synapse Capture - Standalone CSV Extension

A completely standalone browser extension for capturing web content to CSV files. **No backend server required!**

## Features

- 💾 **Quick Save**: Choose between saving full page content or just selected text
- 📥 **CSV Export**: Download all captures as a CSV file
- 🔍 **Search**: Search through your saved captures
- 📚 **Local Storage**: All data stored locally in your browser
- 🎯 **Standalone**: Works completely offline, no server needed

## Installation

### For Chrome/Edge

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. The extension icon should appear in your toolbar

### For Firefox

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the `extension` folder and select `manifest.json`
4. The extension will be loaded temporarily

## Usage

### Method 1: Extension Popup

1. Click the Synapse extension icon in your browser toolbar
2. Click the **"Quick Save to CSV"** button
3. Choose between:
   - **Save Page**: Saves the entire page content
   - **Save Selected Text**: Saves text you've highlighted (disabled if nothing is selected)
4. Your content is saved!

### Method 2: Context Menu (Right-Click)

1. Right-click anywhere on a page
2. Select **"Quick Save to CSV"** from the context menu
3. Choose page or selected text
4. Done!

### Method 3: Save Selected Text Directly

1. Highlight text on any webpage
2. Right-click on the selected text
3. Select **"Save Selected Text to CSV"**
4. Text is saved immediately!

### Method 4: Floating Button

1. Select text on any webpage
2. A floating **"Save to Synapse"** button appears
3. Click it to save the selected text
4. Quick and easy!

## Viewing Your Captures

1. Click the extension icon
2. Switch to the **"Captures"** tab
3. See all your saved items with:
   - Page title
   - Content preview
   - URL
   - Timestamp
   - Type indicator (📄 for pages, ✂️ for selected text)
4. Click any capture to open its URL

## Exporting to CSV

1. Click the extension icon
2. In the Actions tab, click **"Export to CSV"**
3. A CSV file will be downloaded with all your captures
4. Open in Excel, Google Sheets, or any spreadsheet app

### CSV File Format

The exported CSV contains these columns:

| Column | Description |
|--------|-------------|
| Timestamp | When the capture was made (ISO 8601 format) |
| URL | The webpage URL |
| Selected Text | Content if selected text was saved |
| Page Content | Content if full page was saved |
| Type | "page" or "selected_text" |
| Title | Page or document title |

## Searching Captures

1. Click the extension icon
2. Type your search query in the search box
3. Press Enter or click the search button
4. Results will be filtered in the Captures tab

Search works across:
- Page titles
- URLs
- Selected text content
- Page content

## Managing Captures

### Clear All Captures

1. Click the extension icon
2. In the Actions tab, scroll down
3. Click **"Clear All Captures"**
4. Confirm the action
5. All captures will be permanently deleted

**Warning**: This action cannot be undone! Export to CSV first if you want to keep a backup.

## Storage

- All data is stored locally using Chrome's storage API
- No data is sent to any server
- Data persists across browser sessions
- Data is specific to your browser profile

## Permissions

The extension requires these permissions:

- **storage**: To save captures locally
- **downloads**: To export CSV files
- **activeTab**: To read page content and selected text
- **contextMenus**: To add right-click menu options
- **tabs**: To get page information

## Troubleshooting

### Extension not loading?
- Make sure you're in Developer Mode
- Check browser console for errors
- Try reloading the extension

### Captures not saving?
- Check if you have storage space
- Open browser DevTools and check Console tab
- Try reloading the extension

### CSV export not working?
- Make sure downloads are allowed in your browser
- Check your downloads folder
- Try a different browser

### Can't see captures?
- Click the "Captures" tab in the popup
- Try refreshing the popup
- Check if captures were actually saved

## Tips

- **Save frequently**: Export to CSV regularly as a backup
- **Use search**: Filter captures with the search box
- **Select before saving**: If you want to save selected text, highlight it before opening the popup
- **Check the type**: 📄 = full page, ✂️ = selected text

## Data Privacy

- ✅ All data stored locally on your computer
- ✅ No data sent to any server
- ✅ No tracking or analytics
- ✅ No account or login required
- ✅ Works completely offline

## Building from Source

If you want to build the extension yourself:

```bash
cd extension
npm install
npm run build
```

Then load the `dist` folder as an unpacked extension.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the browser console for errors
- Make sure you're using the latest version

---

**Enjoy capturing and organizing your web content!** 📝
