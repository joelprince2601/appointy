# Comet-like Features Implementation

This document describes the Comet-like browser experience features implemented in Synapse Capture.

## Features Overview

### 1. 💬 Ask About This Page
**Implementation:**
- Floating chat widget (bottom-right corner)
- Two modes: "Page" and "Memory"
- In "Page" mode: Answers questions about current page content
- Uses Claude API to analyze page content and answer questions

**How it works:**
1. User clicks floating chat button
2. Selects "Page" mode
3. Asks a question about the current page
4. Extension extracts page content
5. Sends to `/api/ask` endpoint
6. Claude analyzes content and answers question
7. Response displayed in chat

**Files:**
- `extension/chatWidget.js` - Chat UI component
- `extension/pageExtractor.js` - Page content extraction
- `server/routes/ask.js` - Backend endpoint

### 2. 🧠 Save Page Context
**Implementation:**
- Context menu: "Save Page Context to Synapse"
- Extracts page title, content, metadata, images, links
- Saves to backend via `/api/capture`
- Enriched asynchronously with Claude

**How it works:**
1. User right-clicks on page
2. Selects "Save Page Context to Synapse"
3. Extension extracts page data
4. Sends to backend
5. Saved to Supabase captures table
6. Claude enriches metadata in background

**Files:**
- `extension/pageExtractor.js` - Page extraction
- `extension/contentScript.js` - Context menu handler
- `server/routes/capture.js` - Backend endpoint

### 3. 🔎 Ask My Memory Anywhere
**Implementation:**
- Same floating chat widget
- "Memory" mode (default)
- Searches user's saved captures
- Uses Claude to answer based on memories

**How it works:**
1. User clicks chat button
2. Selects "Memory" mode (or it's default)
3. Asks a question
4. Backend fetches relevant memories
5. Claude analyzes memories and answers
6. Response displayed in chat

**Files:**
- `extension/chatWidget.js` - Chat UI
- `server/routes/askMemory.js` - Backend endpoint

### 4. 📚 Reading Mode Summary
**Implementation:**
- Context menu: "Summarize This Page"
- Extracts page sections
- Uses Claude to create summary
- Displays modal with summary and key points

**How it works:**
1. User right-clicks on page
2. Selects "Summarize This Page"
3. Extension extracts page content and sections
4. Sends to `/api/summarize` endpoint
5. Claude creates summary and key points
6. Modal displays summary

**Files:**
- `extension/contentScript.js` - Summary modal
- `extension/pageExtractor.js` - Section extraction
- `server/routes/summarize.js` - Backend endpoint

### 5. 🧩 Instant Memory Graph
**Implementation:**
- D3.js-based graph visualization
- Shows related memories as nodes
- Edges represent relationships
- Interactive drag-and-drop

**How it works:**
1. User views memory graph
2. Extension fetches related memories
3. Calculates similarity using embeddings
4. Renders graph with D3
5. User can interact with nodes

**Files:**
- `extension/memoryGraph.js` - D3 graph component
- `server/routes/search.js` - Similarity search

**Note:** Full embedding-based similarity requires additional setup (see below)

### 6. 🧠 Contextual Recall Prompting
**Implementation:**
- Auto-detects topics as user reads
- Fetches related captures
- Displays "You've seen this before" widget
- Shows up to 3 related memories

**How it works:**
1. User reads page content
2. Extension monitors visible sections
3. Extracts topic keywords
4. Searches for related memories
5. Displays widget with related content
6. User can click to view full memory

**Files:**
- `extension/contextualRecall.js` - Recall widget
- `extension/contentScript.js` - Intersection Observer
- `server/routes/search.js` - Related search

## Setup Instructions

### 1. Install Dependencies

```bash
cd extension
npm install

cd ../server
npm install
```

### 2. Configure Environment

**Extension (`extension/background.js`):**
```javascript
const API_BASE = 'https://api.synapse.myapp.com/api';
```

**Server (`server/.env`):**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLAUDE_API_KEY=your-claude-api-key
```

### 3. Build Extension

```bash
cd extension
npm run build
```

### 4. Load Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked"
5. Select `extension` folder

### 5. Start Backend

```bash
cd server
npm start
```

## API Endpoints

### POST /api/ask
Ask questions about current page.

**Request:**
```json
{
  "question": "What is this page about?",
  "context": {
    "title": "Page Title",
    "url": "https://example.com",
    "content": "Page content..."
  }
}
```

**Response:**
```json
{
  "answer": "This page is about..."
}
```

### POST /api/ask-memory
Ask questions about user's memory.

**Request:**
```json
{
  "question": "What have I saved about React?"
}
```

**Response:**
```json
{
  "answer": "Based on your memories..."
}
```

### POST /api/summarize
Summarize page content.

**Request:**
```json
{
  "pageData": {
    "title": "Page Title",
    "url": "https://example.com",
    "content": "Page content..."
  },
  "sections": [
    {
      "title": "Section 1",
      "content": "Section content..."
    }
  ]
}
```

**Response:**
```json
{
  "summary": "3-line summary...",
  "keyPoints": ["point1", "point2", "point3"],
  "sections": [
    {
      "title": "Section 1",
      "summary": "Section summary..."
    }
  ]
}
```

## Advanced: Embedding-Based Similarity

For true semantic similarity search (like Comet), you'll need:

1. **Generate Embeddings:**
   - Use OpenAI embeddings API or similar
   - Store embeddings in Supabase vector column
   - Generate embeddings when content is saved

2. **Vector Search:**
   - Use Supabase's `pgvector` extension
   - Query similar vectors using cosine similarity
   - Return top N similar memories

3. **Update Search Endpoint:**
   - Generate embedding for query
   - Search similar vectors
   - Return ranked results

**Example Migration:**
```sql
-- Add vector column
ALTER TABLE captures ADD COLUMN embedding vector(1536);

-- Create index
CREATE INDEX ON captures USING ivfflat (embedding vector_cosine_ops);
```

## Usage Examples

### Ask About Page
1. Open any webpage
2. Click floating chat button (bottom-right)
3. Select "Page" mode
4. Ask: "What are the main points of this article?"
5. Get instant answer

### Save Page Context
1. Right-click on page
2. Select "Save Page Context to Synapse"
3. Page content saved automatically
4. Enriched in background

### Ask Memory
1. Click chat button
2. Select "Memory" mode
3. Ask: "What have I learned about machine learning?"
4. Get answer based on your saved memories

### Summarize Page
1. Right-click on page
2. Select "Summarize This Page"
3. View summary modal
4. Save summary to Synapse

### Contextual Recall
1. Read any webpage
2. Extension automatically detects topics
3. Shows "You've seen this before" widget
4. Click to view related memories

## Troubleshooting

### Chat Widget Not Appearing
- Check console for errors
- Verify content script is loaded
- Check manifest.json permissions

### API Errors
- Verify backend is running
- Check API_BASE URL in background.js
- Verify JWT token is valid
- Check CORS configuration

### Memory Search Not Working
- Verify captures exist in database
- Check search endpoint logs
- Verify Claude API key

## Next Steps

1. **Add Embeddings:** Implement vector similarity search
2. **Improve Topic Detection:** Use NLP for better topic extraction
3. **Add Graph Visualization:** Full D3 graph in popup
4. **Add Keyboard Shortcuts:** Quick access to features
5. **Add Settings:** User preferences for features

