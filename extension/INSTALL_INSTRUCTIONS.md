# Quick Install Instructions

## ✅ Extension is Ready!

The extension has been built successfully. All files are in the `dist` folder.

## How to Load the Extension in Chrome/Edge

1. **Open Chrome/Edge** and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. **Enable Developer Mode**
   - Look for the toggle in the top-right corner
   - Turn it ON

3. **Load the Extension**
   - Click **"Load unpacked"** button
   - Navigate to: `D:\check\synapse-jp-main\extension\dist`
   - Select the `dist` folder
   - Click "Select Folder"

4. **Done!**
   - The extension icon should appear in your toolbar
   - Click it to start using the CSV capture feature

## Using the Extension

### Quick Save
1. Click the extension icon
2. Click **"Quick Save to CSV"**
3. Choose:
   - 📄 **Save Page** - saves entire page
   - ✂️ **Save Selected Text** - saves highlighted text (select text first!)

### Export to CSV
1. Click the extension icon
2. Click **"Export to CSV"**
3. Your CSV file will download automatically

### View Captures
1. Click the extension icon
2. Switch to **"Captures"** tab
3. See all saved items with search functionality

## Rebuilding After Changes

If you make any code changes:

```bash
cd D:\check\synapse-jp-main\extension
npm run build
```

Then reload the extension in Chrome:
- Go to `chrome://extensions/`
- Click the refresh icon on the Synapse Capture extension card

## Troubleshooting

### Extension not loading?
- Make sure you selected the **`dist` folder**, not the `extension` folder
- Check if Developer Mode is enabled
- Look for errors in the extensions page

### Popup not opening?
- Right-click the extension icon → Inspect popup
- Check browser console for errors
- Try reloading the extension

### Features not working?
- Open browser DevTools (F12)
- Check Console tab for errors
- Make sure you built the extension (`npm run build`)

## Features Available

✅ Quick Save dialog (page or selected text)
✅ CSV storage with proper columns
✅ Export to CSV file
✅ View all captures
✅ Search through captures
✅ Clear all captures
✅ Context menu options
✅ Floating save button on text selection
✅ 100% standalone (no backend needed)

---

**You're all set!** 🎉

Load the `dist` folder and start capturing!
