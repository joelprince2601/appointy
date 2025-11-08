# Synapse Capture Chrome Extension

A Chrome Extension (Manifest V3) that allows users to capture and save content directly to their Synapse knowledge network.

## Features

- **Text Selection Capture**: Floating "Save to Synapse" button when text is selected
- **Context Menu**: Right-click to save links, images, or selected text
- **Offline Support**: Stores captures locally when offline and syncs when online
- **Popup UI**: React-based popup with recent items, search, and quick access
- **Authentication**: Uses Supabase JWT cookies from the main site

## Setup

### 1. Install Dependencies

```bash
cd extension
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This will create a `dist` folder with the compiled extension files.

### 3. Create Extension Icons

Create the following icon files in `extension/icons/`:
- `icon16.png` (16x16)
- `icon32.png` (32x32)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

You can use any image editor or online tool to create these icons. The icon should represent "Synapse" - consider using a brain, network, or synapse symbol.

### 4. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder (or the `extension` folder if you're running from source)

### 5. Configure API Endpoints

Update the `API_BASE` constant in:
- `background.js` (line 7)
- `popup.jsx` (line 8)

Change `https://synapse.myapp.com/api` to your actual API endpoint.

## Development

### Watch Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### File Structure

```
extension/
├── manifest.json          # Extension manifest
├── background.js         # Service worker
├── contentScript.js       # Content script for page interaction
├── content.css           # Styles for content script
├── storage.js             # IndexedDB storage manager
├── popup.html             # Popup HTML
├── popup.jsx              # React popup component
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
├── icons/                 # Extension icons (create these)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── dist/                  # Built files (generated)
```

## API Endpoints

The extension expects the following API endpoints:

### POST /api/capture

Save captured content.

**Request:**
```json
{
  "content": "selected text or link",
  "url": "page url",
  "type": "auto-detected type",
  "timestamp": "ISO timestamp"
}
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### GET /api/recent

Get recent captures.

**Response:**
```json
[
  {
    "content": "...",
    "url": "...",
    "type": "...",
    "timestamp": "..."
  }
]
```

### GET /api/search?q=...

Search memories.

**Response:**
```json
[
  {
    "title": "...",
    "summary": "...",
    "url": "..."
  }
]
```

## Authentication

The extension automatically retrieves Supabase JWT tokens from cookies. It looks for cookies with names like:
- `sb-*-auth-token`
- `supabase.auth.token`

Make sure your main site sets these cookies with the proper domain (`.myapp.com`).

## Offline Support

When offline, captures are stored in IndexedDB and automatically synced when the connection is restored. The extension checks for pending items:
- When coming back online
- Every 5 minutes
- After a successful capture

## Troubleshooting

### Extension not loading
- Check that all files are in the correct location
- Verify `manifest.json` is valid JSON
- Check Chrome's extension error page for details

### Authentication not working
- Verify cookies are set with the correct domain
- Check that the cookie name matches what the extension expects
- Ensure CORS is configured correctly on your API

### Icons not showing
- Create the icon files in the `icons/` folder
- Ensure they're PNG format
- Check file paths in `manifest.json`

## License

Part of the Synapse project.

