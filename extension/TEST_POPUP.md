# Testing the Popup

## Steps to Test:

1. **Open Chrome Extensions Page:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the Extension:**
   - Click "Load unpacked"
   - Navigate to `D:\check\synapse-jp-main\extension\dist`
   - Select the folder

3. **Open the Popup:**
   - Click the extension icon in the toolbar
   - The popup should open

4. **Check Console for Errors:**
   - Right-click on the popup window
   - Select "Inspect" or "Inspect popup"
   - Go to the Console tab
   - Look for:
     - "Initializing React app..."
     - "Container found, creating root..."
     - "Root created, rendering Popup component..."
     - "Popup component rendered successfully!"
   - If you see errors, note them down

5. **What You Should See:**
   - Header with "Synapse Capture" title
   - Search bar
   - Tab buttons (Actions / Recent)
   - Action buttons:
     - 🧠 Save Page Context
     - 💬 Ask About This Page
     - 📚 Summarize This Page
     - 🔎 Ask My Memory
     - 🧩 Find Related Ideas
   - "Open Synapse Web App" button

## Common Issues:

1. **Blank Popup:**
   - Check console for errors
   - Verify `popup.js` is loading (check Network tab)
   - Check if `popup.css` is loading

2. **CSP Errors:**
   - The manifest CSP has been updated to allow 'wasm-unsafe-eval'
   - If you see CSP errors, reload the extension

3. **React Not Loading:**
   - Check if `popup.js` file exists in `dist/` folder
   - Check file size (should be ~150KB)
   - Verify the script tag in `popup.html` points to `./popup.js`

## Debugging:

If the popup is still blank:
1. Open DevTools (right-click popup → Inspect)
2. Check Console tab for errors
3. Check Network tab to see if files are loading
4. Check if `popup.js` is being loaded successfully

