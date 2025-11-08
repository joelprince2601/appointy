# Pathway Chatbot Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Configure Claude API Key

Create a `.env` file in the `server` directory:

```env
CLAUDE_API_KEY=your-claude-api-key-here
PORT=3001
```

**Getting a Claude API Key:**
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy it to your `.env` file

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

## Troubleshooting

### Port Already in Use Error

If you get an error that port 3001 is already in use:

1. **Quick fix - Kill the process:**
   ```bash
   npm run kill:port
   ```

2. **Manual fix:**
   ```bash
   # Find the process
   netstat -ano | findstr :3001
   
   # Kill the process (replace <PID> with the actual process ID)
   taskkill /PID <PID> /F
   ```

3. **Automatic fallback:**
   The server will automatically try ports 3002, 3003, etc. if 3001 is in use.
   If it uses an alternative port, update `vite.config.ts` proxy target accordingly.

### Concurrently Not Found

If you get an error that `concurrently` is not recognized:

```bash
npm install concurrently --save-dev
```

### Server Won't Start

1. Check if the port is free:
   ```bash
   npm run kill:port
   ```

2. Verify your `.env` file exists in the `server` directory

3. Check that all dependencies are installed:
   ```bash
   cd server
   npm install
   ```

4. Make sure Node.js version is 18 or higher:
   ```bash
   node --version
   ```

## Usage

1. Navigate to `/pathway-chatbot` in your web application
2. Click "Upload CSV" to add CSV files
3. Once files are uploaded, ask questions about your CSV data
4. The chatbot will analyze the data and provide answers using Claude AI

## API Endpoint

The API server runs on `http://localhost:3001` (or alternative port if 3001 is in use).

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Chat Endpoint:**
```bash
POST http://localhost:3001/api/chat-with-csv
Content-Type: application/json

{
  "question": "What is the total revenue?",
  "csvContext": "Timestamp,URL,Selected Text,Page Content,Type,Title\n..."
}
```

