# Pathway Chatbot Feature

A NotebookLM-style chatbot interface that allows you to ask questions about your CSV data using Google Gemini AI.

## Features

- 📄 **CSV Upload**: Upload multiple CSV files to provide context
- 💬 **Chat Interface**: Ask questions about your CSV data
- 🤖 **Gemini AI Integration**: Uses Google Gemini API to analyze and answer questions
- 🎨 **NotebookLM-style UI**: Clean, modern interface similar to Google NotebookLM

## Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Configure Gemini API Key

The `.env` file in the `server` directory is already configured with the Gemini API key:

```env
GEMINI_API_KEY=XYZ
PORT=3001
```

**Getting a Gemini API Key (if needed):**
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API key" to generate a new key
4. Copy it to your `.env` file

### 3. Run the Application

**Option 1: Run both servers together (recommended)**
```bash
npm run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:server
```

The frontend will be available at `http://localhost:8080`
The API server will be available at `http://localhost:3001`

## Usage

1. Navigate to `/pathway-chatbot` in your web application
2. Click "Upload CSV" to add CSV files
3. Once files are uploaded, you can start asking questions
4. The chatbot will analyze your CSV data and provide answers using Claude AI

## How It Works

1. **CSV Upload**: Files are read and stored in the browser's memory
2. **Question Processing**: When you ask a question, all CSV content is sent as context
3. **Gemini API**: The question and CSV context are sent to Google Gemini API
4. **Response**: Gemini analyzes the data and returns an answer
5. **Display**: The answer is displayed in the chat interface

## File Structure

```
src/
├── pages/
│   └── PathwayChatbot.tsx    # Main chatbot page component
server/
├── api/
│   └── chat-with-csv.js      # API endpoint handler
├── server.js                  # Express server
└── package.json               # Server dependencies
```

## API Endpoint

### POST /api/chat-with-csv

**Request:**
```json
{
  "question": "What is the total revenue?",
  "csvContext": "Timestamp,URL,Selected Text,Page Content,Type,Title\n..."
}
```

**Response:**
```json
{
  "answer": "Based on the CSV data provided..."
}
```

## Troubleshooting

### API Key Not Working
- Verify your Gemini API key is correct
- Check that the `.env` file is in the `server` directory
- The API key is already configured, but you can update it if needed

### CORS Errors
- The server has CORS enabled
- Vite proxy should handle this automatically
- Check `vite.config.ts` proxy configuration

### Server Not Starting
- Make sure port 3001 is not in use
- Check that all dependencies are installed
- Verify Node.js version (recommended: 18+)

## Next Steps

- Add CSV parsing and validation
- Implement file persistence (save uploaded files)
- Add support for multiple chat sessions
- Implement conversation history
- Add export functionality for chat conversations


