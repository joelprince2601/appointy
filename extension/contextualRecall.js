/**
 * Contextual Recall Widget
 * Auto-fetches and displays related captures when reading topics
 */

class ContextualRecall {
  constructor() {
    this.widget = null;
    this.relatedMemories = [];
    this.currentTopic = null;
    this.init();
  }

  init() {
    // Monitor page content for topic changes
    this.observePageContent();
    
    // Create widget container
    this.createWidget();
  }

  observePageContent() {
    // Use Intersection Observer to detect when user is reading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.checkForRelatedContent(entry.target);
        }
      });
    }, {
      rootMargin: '0px',
      threshold: 0.5,
    });

    // Observe main content sections
    const sections = document.querySelectorAll('h1, h2, h3, article, section');
    sections.forEach(section => {
      observer.observe(section);
    });
  }

  async checkForRelatedContent(element) {
    const text = element.textContent || element.innerText || '';
    const topic = this.extractTopic(text);

    if (topic && topic !== this.currentTopic) {
      this.currentTopic = topic;
      await this.fetchRelatedMemories(topic);
    }
  }

  extractTopic(text) {
    // Simple topic extraction (can be enhanced with NLP)
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const keywords = words.filter(w => w.length > 3 && !stopWords.has(w));
    
    // Get most common keywords
    const counts = {};
    keywords.forEach(k => counts[k] = (counts[k] || 0) + 1);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    
    return sorted[0]?.[0] || null;
  }

  async fetchRelatedMemories(topic) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'searchRelated',
        query: topic,
        limit: 3,
      });

      if (response && response.memories) {
        this.relatedMemories = response.memories;
        this.updateWidget();
      }
    } catch (error) {
      console.error('Error fetching related memories:', error);
    }
  }

  createWidget() {
    this.widget = document.createElement('div');
    this.widget.id = 'synapse-contextual-recall';
    this.widget.innerHTML = `
      <div class="synapse-recall-header">
        <span class="synapse-recall-icon">💡</span>
        <span class="synapse-recall-title">You've seen this before</span>
        <button class="synapse-recall-close">×</button>
      </div>
      <div class="synapse-recall-content" id="synapse-recall-content">
        <div class="synapse-recall-loading">Loading related memories...</div>
      </div>
    `;

    // Close button
    this.widget.querySelector('.synapse-recall-close').addEventListener('click', () => {
      this.hide();
    });

    // Initially hidden
    this.widget.classList.add('hidden');
    document.body.appendChild(this.widget);
  }

  updateWidget() {
    if (this.relatedMemories.length === 0) {
      this.hide();
      return;
    }

    const content = this.widget.querySelector('#synapse-recall-content');
    content.innerHTML = this.relatedMemories.map(memory => `
      <div class="synapse-recall-item" data-id="${memory.id}">
        <div class="synapse-recall-item-title">${memory.title || memory.content.substring(0, 50)}</div>
        <div class="synapse-recall-item-summary">${memory.summary || memory.content.substring(0, 100)}</div>
        <div class="synapse-recall-item-meta">
          <span class="synapse-recall-item-type">${memory.type}</span>
          <span class="synapse-recall-item-date">${new Date(memory.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    this.widget.querySelectorAll('.synapse-recall-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        chrome.runtime.sendMessage({
          action: 'openMemory',
          id,
        });
      });
    });

    this.show();
  }

  show() {
    this.widget.classList.remove('hidden');
  }

  hide() {
    this.widget.classList.add('hidden');
  }
}

// Initialize contextual recall
let contextualRecall = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    contextualRecall = new ContextualRecall();
  });
} else {
  contextualRecall = new ContextualRecall();
}

// Export for use in other modules
export { ContextualRecall };

