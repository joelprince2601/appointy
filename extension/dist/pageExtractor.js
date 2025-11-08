/**
 * Page Content Extractor
 * Extracts text, title, metadata from current page
 */

class PageExtractor {
  static extract() {
    const title = document.title;
    const url = window.location.href;
    const description = this.getMetaDescription();
    const author = this.getMetaAuthor();
    const keywords = this.getMetaKeywords();
    const mainContent = this.extractMainContent();
    const images = this.extractImages();
    const links = this.extractLinks();

    return {
      title,
      url,
      description,
      author,
      keywords,
      content: mainContent,
      images,
      links,
      timestamp: new Date().toISOString(),
      wordCount: mainContent.split(/\s+/).length,
    };
  }

  static getMetaDescription() {
    const meta = document.querySelector('meta[name="description"]') ||
                 document.querySelector('meta[property="og:description"]');
    return meta ? meta.content : '';
  }

  static getMetaAuthor() {
    const meta = document.querySelector('meta[name="author"]') ||
                 document.querySelector('meta[property="article:author"]');
    return meta ? meta.content : '';
  }

  static getMetaKeywords() {
    const meta = document.querySelector('meta[name="keywords"]');
    return meta ? meta.content.split(',').map(k => k.trim()) : [];
  }

  static extractMainContent() {
    // Remove unwanted elements
    const unwanted = document.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar');
    unwanted.forEach(el => el.remove());

    // Try to find main content
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.main-content',
      '#content',
      '#main',
    ];

    let main = null;
    for (const selector of selectors) {
      main = document.querySelector(selector);
      if (main) break;
    }

    if (!main) {
      main = document.body;
    }

    // Extract text
    let text = main.innerText || main.textContent || '';
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit length
    const maxLength = 50000; // For Claude API
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }

    return text;
  }

  static extractImages() {
    const images = Array.from(document.querySelectorAll('img'))
      .filter(img => img.src && !img.src.startsWith('data:'))
      .map(img => ({
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0,
      }))
      .slice(0, 10); // Limit to 10 images

    return images;
  }

  static extractLinks() {
    const links = Array.from(document.querySelectorAll('a[href]'))
      .filter(a => a.href && !a.href.startsWith('javascript:'))
      .map(a => ({
        href: a.href,
        text: a.textContent.trim() || '',
      }))
      .slice(0, 20); // Limit to 20 links

    return links;
  }

  static extractSections() {
    const sections = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent.trim();
      
      // Get content until next heading
      let content = '';
      let next = heading.nextElementSibling;
      while (next && !next.matches('h1, h2, h3, h4, h5, h6')) {
        content += (next.textContent || '') + ' ';
        next = next.nextElementSibling;
      }

      sections.push({
        level,
        title: text,
        content: content.trim(),
      });
    });

    return sections;
  }
}

// Export for use in other modules
export { PageExtractor };

