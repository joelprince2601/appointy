# 🧠 Project Synapse - Your AI-Powered Second Brain

**Transform how you capture, organize, and interact with knowledge using cutting-edge AI technology.**

Project Synapse is a comprehensive knowledge management platform that combines intelligent memory storage, semantic search, neural network visualization, and AI-powered conversation to create your personal second brain. Built with modern web technologies and powered by Google Gemini AI, Synapse helps you build a connected knowledge network that grows smarter over time.

---

## ✨ Key Features

### 🎯 **Intelligent Memory Management**
- **Smart Memory Capture**: Save thoughts, ideas, articles, and insights with rich metadata
- **Automatic Tagging**: AI-powered tag suggestions based on content analysis
- **Memory Connections**: Automatically detect and visualize relationships between memories
- **Rich Content Support**: Text, links, images, and structured data all in one place
- **Advanced Search**: Full-text search with semantic understanding across all your memories
- **Memory Types**: Organize by type (article, note, idea, quote, etc.) with custom emoji indicators

### 🤖 **AI-Powered Pathway Chatbot**
- **Conversational AI Interface**: Chat with your knowledge base using natural language
- **Agentic Semantic Search**: Advanced AI-powered search that understands context and intent
- **Context-Aware Responses**: Automatically retrieves relevant memories to provide accurate answers
- **Conversation History**: Persistent chat history with conversation threading
- **Multi-Modal Understanding**: Processes text, structured data, and relationships
- **Real-Time Memory Integration**: Dynamically incorporates new memories into conversations
- **Smart Context Selection**: Only uses the most relevant memories for each query

### 🧬 **Neural Network Visualization**
- **Interactive Memory Graph**: Visualize your knowledge as a connected neural network
- **Force-Directed Layout**: Physics-based simulation showing memory relationships
- **Relationship Mapping**: See how memories connect through tags, topics, and content
- **Interactive Exploration**: Click nodes to explore memory details, zoom and pan controls
- **Real-Time Updates**: Network updates as you add new memories
- **Connection Strength**: Visual indicators show relationship strength between memories

### 🌐 **Chrome Extension - Web Capture Suite**
- **One-Click Content Capture**: Save any webpage content with a single click
- **Smart Text Selection**: Floating save button appears when you select text
- **Context Menu Integration**: Right-click to save links, images, or selected content
- **Page Context Extraction**: Automatically extracts and saves page metadata, images, and links
- **Offline-First Architecture**: Works offline with automatic sync when connection restored
- **In-Page Chat Widget**: Ask questions about the current page without leaving it
- **Memory Mode Chat**: Query your entire knowledge base from any webpage
- **Reading Mode Summaries**: Get instant AI-generated summaries of any article
- **Contextual Recall**: Automatically surfaces related memories while browsing
- **Background Sync**: Seamlessly syncs captures across all your devices

### 💾 **Advanced Storage & Sync**
- **Cloud-Native Architecture**: Built on Supabase for reliable, scalable storage
- **Real-Time Synchronization**: Changes sync instantly across all devices
- **Offline Support**: Full functionality even without internet connection
- **Data Export**: Export your memories in multiple formats (CSV, JSON)
- **Backup & Restore**: Automatic backups with point-in-time recovery
- **Multi-Device Access**: Access your knowledge network from any device

### 🔍 **Powerful Search & Discovery**
- **Semantic Search**: Find memories by meaning, not just keywords
- **Multi-Faceted Filtering**: Filter by type, tags, date, and content
- **Search Suggestions**: AI-powered search suggestions as you type
- **Related Memory Discovery**: Automatically discover related memories
- **Search History**: Track and revisit your search queries
- **Advanced Query Syntax**: Support for complex search queries

### 🎨 **Modern, Beautiful Interface**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Eye-friendly dark theme with smooth transitions
- **Customizable UI**: Personalize your workspace with themes and layouts
- **Smooth Animations**: Polished interactions and transitions throughout
- **Accessibility First**: Built with accessibility standards in mind
- **Keyboard Shortcuts**: Power user shortcuts for rapid navigation

### 🔐 **Enterprise-Grade Security**
- **End-to-End Encryption**: Your data is encrypted in transit and at rest
- **User Authentication**: Secure authentication with Supabase Auth
- **Role-Based Access**: Control who can access your memories
- **Privacy Controls**: Granular privacy settings for each memory
- **Audit Logging**: Track all changes to your knowledge base

### 📊 **Analytics & Insights**
- **Memory Statistics**: Track your knowledge growth over time
- **Tag Analytics**: See which topics you explore most
- **Connection Insights**: Discover patterns in your knowledge network
- **Activity Timeline**: Visualize your memory creation timeline
- **Usage Reports**: Understand how you interact with your knowledge

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm (or bun)
- **Supabase Account** (for database and authentication)
- **Google Gemini API Key** (for AI features)
- **Chrome Browser** (for extension features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd main_synapse
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   
   # Install extension dependencies
   cd extension
   npm install
   cd ..
   ```

3. **Configure environment variables**

   Create `server/.env`:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   
   # Gemini AI Configuration
   GEMINI_API_KEY=your-gemini-api-key
   
   # Server Configuration
   PORT=3001
   ```

   Create `.env` in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```

4. **Set up the database**

   Run the Supabase migrations:
   ```bash
   # If using Supabase CLI
   supabase migration up
   
   # Or apply manually in Supabase dashboard
   # Copy and run the SQL from: supabase/migrations/
   ```

5. **Build the Chrome extension**
   ```bash
   cd extension
   npm run build
   cd ..
   ```

6. **Start the development servers**
   ```bash
   # Run both frontend and backend together
   npm run dev:all
   
   # Or run separately:
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   npm run dev:server
   ```

7. **Load the Chrome extension**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/dist` folder

---

## 📖 Usage Guide

### Creating Your First Memory

1. Navigate to the Dashboard
2. Click the "Add Memory" button
3. Fill in the memory details:
   - **Title**: A descriptive title
   - **Content**: The main content of your memory
   - **Type**: Select the type (article, note, idea, etc.)
   - **Tags**: Add relevant tags (comma-separated)
   - **Emoji**: Choose an emoji to represent this memory
4. Click "Save" - your memory is now part of your knowledge network!

### Using the Pathway Chatbot

1. Navigate to `/pathway-chatbot`
2. Start a conversation by asking a question
3. The chatbot will:
   - Use agentic search to find relevant memories
   - Analyze the context
   - Provide an answer based on your knowledge base
4. All conversations are automatically saved

### Exploring the Neural Network

1. Navigate to `/neural-network`
2. See your memories visualized as connected nodes
3. Click any node to see memory details
4. Zoom and pan to explore different areas
5. Watch as connections form between related memories

### Capturing Web Content

1. **Using the Chrome Extension**:
   - Select text on any webpage → Click the floating "Save" button
   - Right-click → "Save Page Context to Synapse"
   - Use the chat widget to ask questions about the current page

2. **Using Quick Save Widget**:
   - Click the floating widget on any page
   - Paste or type content
   - Add tags and save

### Advanced Search

1. Navigate to `/memories`
2. Use the search bar for keyword search
3. Filter by type, tags, or date
4. Use semantic search in the chatbot for meaning-based discovery

---

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **D3.js** for neural network visualization

### Backend Stack
- **Node.js** with Express
- **Supabase** for database and authentication
- **Google Gemini AI** for intelligent features
- **RESTful API** architecture

### Extension Stack
- **Manifest V3** Chrome Extension
- **React** for popup UI
- **IndexedDB** for offline storage
- **Content Scripts** for page interaction

### Database Schema
- **memories**: Core memory storage with rich metadata
- **conversations**: Chat conversation tracking
- **conversation_messages**: Individual message storage
- **tags**: Tag management and relationships
- **memory_connections**: Relationship mapping between memories

---

## 🔌 API Endpoints

### Memory Management
- `POST /api/save-memory` - Save a new memory
- `GET /api/memories` - Retrieve user memories
- `PUT /api/memories/:id` - Update a memory
- `DELETE /api/memories/:id` - Delete a memory

### AI Features
- `POST /api/chat-with-memories` - Chat with your knowledge base
- `POST /api/agentic-search` - Semantic search through memories
- `POST /api/chat-with-csv` - Legacy CSV-based chat (for compatibility)

### Extension API
- `POST /api/capture` - Save captured web content
- `GET /api/recent` - Get recent captures
- `GET /api/search` - Search memories from extension

---

## 🛠️ Development

### Project Structure
```
main_synapse/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utility functions
├── server/                # Backend Express server
│   ├── api/               # API route handlers
│   └── server.js          # Server entry point
├── extension/             # Chrome extension
│   ├── dist/              # Built extension files
│   ├── background.js      # Service worker
│   ├── contentScript.js   # Content script
│   └── popup.jsx          # Extension popup
├── supabase/              # Database migrations
│   └── migrations/        # SQL migration files
└── public/                # Static assets
```

### Available Scripts

**Root directory:**
- `npm run dev` - Start frontend development server
- `npm run dev:server` - Start backend server
- `npm run dev:all` - Run both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Extension directory:**
- `npm run build` - Build extension
- `npm run dev` - Watch mode for development

**Server directory:**
- `npm start` - Start production server

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🎯 Roadmap

### Upcoming Features
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **Collaborative Spaces**: Share knowledge networks with teams
- [ ] **Advanced AI Models**: Support for multiple AI providers
- [ ] **Voice Input**: Speak your memories and questions
- [ ] **Image Recognition**: Extract text and insights from images
- [ ] **PDF Processing**: Direct PDF upload and analysis
- [ ] **Webhooks**: Integrate with other tools and services
- [ ] **API Access**: Public API for third-party integrations
- [ ] **Templates**: Memory templates for common use cases
- [ ] **Export Formats**: Export to Markdown, Notion, Obsidian, etc.
- [ ] **Version History**: Track changes to memories over time
- [ ] **Comments & Annotations**: Add notes to existing memories

---

## 🤝 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs or request features on GitHub Issues
- **Discussions**: Join discussions in GitHub Discussions
- **Email**: Contact support at [your-email]

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language understanding
- **Supabase** for the amazing backend infrastructure
- **shadcn/ui** for beautiful, accessible components
- **The Open Source Community** for inspiration and tools

---

## 🌟 Star History

If you find Project Synapse useful, please consider giving it a star ⭐ on GitHub!

---

**Built with ❤️ by the Synapse Team**

*Transform your knowledge into intelligence.*
