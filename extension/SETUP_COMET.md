# Comet-like Features Setup Guide

Complete setup instructions for all Comet-like features in Synapse Capture.

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
cp env.example .env
# Edit .env with your credentials
npm start
```

### 2. Extension Setup

```bash
cd extension
npm install
npm run build
```

### 3. Load Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked"
5. Select `extension` folder

## Features Checklist

✅ **Ask About This Page**
- Floating chat button appears (bottom-right)
- Click to open chat
- Select "Page" mode
- Ask questions about current page

✅ **Save Page Context**
- Right-click on page
- Select "Save Page Context to Synapse"
- Page content saved automatically

✅ **Ask My Memory**
- Click chat button
- Select "Memory" mode
- Ask questions about your saved memories

✅ **Reading Mode Summary**
- Right-click on page
- Select "Summarize This Page"
- View summary modal

✅ **Contextual Recall**
- Automatically appears when reading
- Shows related memories
- Click to view full memory

✅ **Memory Graph**
- D3 visualization component ready
- Requires embedding setup for full functionality

## Testing Each Feature

### Test Ask About Page
1. Open any article page
2. Click floating chat button
3. Select "Page" mode
4. Ask: "What is this article about?"
5. Should get answer based on page content

### Test Save Page Context
1. Open any webpage
2. Right-click → "Save Page Context to Synapse"
3. Check notification
4. Verify in Supabase captures table

### Test Ask Memory
1. Save some content first
2. Click chat button
3. Select "Memory" mode
4. Ask: "What have I saved about [topic]?"
5. Should get answer based on memories

### Test Summarize Page
1. Open long article
2. Right-click → "Summarize This Page"
3. Should see summary modal
4. Can save summary to Synapse

### Test Contextual Recall
1. Open page with content you've saved before
2. Scroll through page
3. Should see "You've seen this before" widget
4. Click to view related memories

## Troubleshooting

### Chat Widget Not Appearing
- Check browser console for errors
- Verify content script is loaded
- Check manifest.json permissions
- Reload extension

### API Errors
- Verify backend is running
- Check API_BASE URL in background.js
- Verify JWT token is valid
- Check CORS configuration
- Check Claude API key

### Contextual Recall Not Working
- Verify you have saved memories
- Check Intersection Observer
- Verify search endpoint works
- Check console for errors

## Next Steps

1. **Add Embeddings:** For true semantic similarity
2. **Improve UI:** Polish chat interface
3. **Add Keyboard Shortcuts:** Quick access
4. **Add Settings:** User preferences
5. **Add Analytics:** Track usage

## File Structure

```
extension/
├── chatWidget.js          # Floating chat UI
├── pageExtractor.js       # Page content extraction
├── contextualRecall.js    # Contextual recall widget
├── memoryGraph.js         # D3 graph visualization
├── contentScript.js       # Main content script
├── background.js          # Service worker
└── manifest.json          # Extension manifest

server/
├── routes/
│   ├── ask.js            # Ask about page
│   ├── askMemory.js      # Ask memory
│   ├── summarize.js      # Summarize page
│   ├── capture.js        # Save captures
│   ├── recent.js         # Recent captures
│   └── search.js         # Search memories
└── server.js             # Main server
```

## API Endpoints

- `POST /api/ask` - Ask about page
- `POST /api/ask-memory` - Ask memory
- `POST /api/summarize` - Summarize page
- `POST /api/capture` - Save capture
- `GET /api/recent` - Recent captures
- `GET /api/search?q=...` - Search memories

All endpoints require JWT authentication.

