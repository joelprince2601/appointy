/**
 * Floating Claude Chat Widget
 * Comet-like chat interface for asking about pages and memory recall
 */

class ChatWidget {
  constructor() {
    this.isOpen = false;
    this.mode = 'page'; // 'page' or 'memory'
    this.chatContainer = null;
    this.messages = [];
    this.pageContext = null;
    this.init();
  }

  init() {
    this.createToggleButton();
    this.createChatContainer();
    this.loadPageContext();
  }

  createToggleButton() {
    const button = document.createElement('div');
    button.id = 'synapse-chat-toggle';
    button.innerHTML = `
      <button class="synapse-chat-toggle-btn" title="Ask Synapse">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    `;

    button.querySelector('button').addEventListener('click', () => {
      this.toggle();
    });

    document.body.appendChild(button);
  }

  createChatContainer() {
    this.chatContainer = document.createElement('div');
    this.chatContainer.id = 'synapse-chat-container';
    this.chatContainer.innerHTML = `
      <div class="synapse-chat-header">
        <div class="synapse-chat-title">
          <span class="synapse-chat-icon">🧠</span>
          <span>Synapse</span>
        </div>
        <div class="synapse-chat-controls">
          <button class="synapse-chat-mode-btn" data-mode="page" title="Ask about this page">
            📄 Page
          </button>
          <button class="synapse-chat-mode-btn active" data-mode="memory" title="Ask my memory">
            🧠 Memory
          </button>
          <button class="synapse-chat-close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="synapse-chat-messages" id="synapse-chat-messages"></div>
      <div class="synapse-chat-input-container">
        <input 
          type="text" 
          id="synapse-chat-input" 
          placeholder="Ask about this page or search your memory..."
          autocomplete="off"
        />
        <button id="synapse-chat-send" title="Send">→</button>
      </div>
    `;

    // Event listeners
    this.chatContainer.querySelector('.synapse-chat-close-btn').addEventListener('click', () => {
      this.close();
    });

    this.chatContainer.querySelectorAll('.synapse-chat-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setMode(e.target.dataset.mode);
      });
    });

    const input = this.chatContainer.querySelector('#synapse-chat-input');
    const sendBtn = this.chatContainer.querySelector('#synapse-chat-send');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });

    document.body.appendChild(this.chatContainer);
  }

  async loadPageContext() {
    // Extract page content
    const title = document.title;
    const url = window.location.href;
    
    // Extract main text content
    const mainContent = this.extractPageText();
    
    this.pageContext = {
      title,
      url,
      content: mainContent,
      timestamp: new Date().toISOString(),
    };
  }

  extractPageText() {
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, nav, header, footer, aside');
    scripts.forEach(el => el.remove());

    // Get main content
    const main = document.querySelector('main, article, [role="main"]') || document.body;
    
    // Extract text
    let text = main.innerText || main.textContent || '';
    
    // Clean up
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit to 10000 characters for Claude
    if (text.length > 10000) {
      text = text.substring(0, 10000) + '...';
    }
    
    return text;
  }

  setMode(mode) {
    this.mode = mode;
    
    // Update UI
    this.chatContainer.querySelectorAll('.synapse-chat-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const input = this.chatContainer.querySelector('#synapse-chat-input');
    if (mode === 'page') {
      input.placeholder = 'Ask about this page...';
    } else {
      input.placeholder = 'Search your memory...';
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.chatContainer.classList.add('open');
    this.chatContainer.querySelector('#synapse-chat-input').focus();
  }

  close() {
    this.isOpen = false;
    this.chatContainer.classList.remove('open');
  }

  async sendMessage() {
    const input = this.chatContainer.querySelector('#synapse-chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Clear input
    input.value = '';

    // Add user message
    this.addMessage('user', message);

    // Show loading
    const loadingId = this.addMessage('assistant', 'Thinking...', true);

    try {
      let response;
      
      if (this.mode === 'page') {
        response = await this.askAboutPage(message);
      } else {
        response = await this.askMemory(message);
      }

      // Update loading message
      this.updateMessage(loadingId, 'assistant', response);
    } catch (error) {
      console.error('Error sending message:', error);
      this.updateMessage(loadingId, 'assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }

  async askAboutPage(question) {
    // Call backend API with page context
    const response = await chrome.runtime.sendMessage({
      action: 'askAboutPage',
      question,
      context: this.pageContext,
    });

    return response.answer || 'I couldn\'t process your question.';
  }

  async askMemory(question) {
    // Call backend API for memory search
    const response = await chrome.runtime.sendMessage({
      action: 'askMemory',
      question,
    });

    return response.answer || 'I couldn\'t find relevant information in your memory.';
  }

  addMessage(role, content, isLoading = false) {
    const messagesContainer = this.chatContainer.querySelector('#synapse-chat-messages');
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    
    const messageEl = document.createElement('div');
    messageEl.className = `synapse-chat-message synapse-chat-message-${role}`;
    messageEl.id = messageId;
    messageEl.innerHTML = `
      <div class="synapse-chat-message-content">
        ${this.formatMessage(content)}
      </div>
    `;

    if (isLoading) {
      messageEl.classList.add('loading');
    }

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.messages.push({ id: messageId, role, content, isLoading });
    return messageId;
  }

  updateMessage(messageId, role, content) {
    const messageEl = document.getElementById(messageId);
    if (messageEl) {
      messageEl.classList.remove('loading');
      messageEl.querySelector('.synapse-chat-message-content').innerHTML = this.formatMessage(content);
      
      // Update in messages array
      const msg = this.messages.find(m => m.id === messageId);
      if (msg) {
        msg.content = content;
        msg.isLoading = false;
      }
    }
  }

  formatMessage(content) {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
}

// Initialize chat widget
let chatWidget = null;

// Export function to initialize chat widget programmatically
export function initChatWidget(mode = 'page') {
  if (chatWidget) {
    chatWidget.setMode(mode);
    chatWidget.toggle();
    return chatWidget;
  }
  
  chatWidget = new ChatWidget();
  chatWidget.setMode(mode);
  chatWidget.toggle();
  return chatWidget;
}

// Auto-initialize on page load (optional)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!chatWidget) {
      chatWidget = new ChatWidget();
    }
  });
} else {
  if (!chatWidget) {
    chatWidget = new ChatWidget();
  }
}

