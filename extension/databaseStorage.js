/**
 * Database Storage Manager for Synapse Capture Extension
 * Saves captures directly to PostgreSQL database via API
 */

export class DatabaseStorage {
  constructor() {
    this.apiBase = 'http://localhost:3001/api';
    this.loadConfig();
  }

  /**
   * Load API configuration from storage
   */
  async loadConfig() {
    try {
      const result = await chrome.storage.local.get(['api_base']);
      if (result.api_base) {
        this.apiBase = result.api_base;
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  /**
   * Get Supabase auth token from cookies or storage
   */
  async getAuthToken() {
    try {
      // Try to get from cookies (set by main web app)
      const allCookies = await chrome.cookies.getAll({});
      
      // Look for Supabase auth token in cookies
      // Supabase stores tokens in cookies like: sb-<project-ref>-auth-token
      const authCookie = allCookies.find(cookie => {
        const name = cookie.name.toLowerCase();
        return (name.includes('sb-') && name.includes('auth-token')) ||
               name === 'supabase.auth.token';
      });

      if (authCookie) {
        try {
          const tokenData = JSON.parse(authCookie.value);
          return tokenData.access_token || tokenData;
        } catch {
          return authCookie.value;
        }
      }

      // Try to get from storage (set by content script from localStorage)
      const storage = await chrome.storage.local.get(['supabase_token', 'auth_token']);
      return storage.supabase_token || storage.auth_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Get user ID from token or API
   */
  async getUserId(token) {
    if (!token) return null;

    try {
      // Decode JWT to get user ID
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return payload.sub || payload.user_id || null;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }

    return null;
  }

  /**
   * Get API base URL
   */
  getApiBase() {
    return this.apiBase;
  }

  /**
   * Extract tags from content
   */
  extractTags(content, metadata) {
    const tags = [];
    
    // Extract from URL domain
    if (metadata?.url) {
      try {
        const url = new URL(metadata.url);
        const domain = url.hostname.replace('www.', '');
        tags.push(domain.split('.')[0]);
      } catch (e) {
        // Ignore URL parsing errors
      }
    }

    // Extract common keywords (simple approach)
    const commonWords = ['react', 'javascript', 'python', 'ai', 'machine learning', 'web', 'design', 'tutorial'];
    const contentLower = (content || '').toLowerCase();
    commonWords.forEach(word => {
      if (contentLower.includes(word)) {
        tags.push(word);
      }
    });

    return tags.slice(0, 5); // Limit to 5 tags
  }

  /**
   * Update API configuration
   */
  async updateConfig(apiBase) {
    try {
      await chrome.storage.local.set({
        api_base: apiBase,
      });
      this.apiBase = apiBase;
    } catch (error) {
      console.error('Error updating config:', error);
    }
  }
}

