/**
 * Authentication Helper for Extension
 * Gets auth token from main web app
 */

export class AuthHelper {
  /**
   * Get auth token from main app's localStorage
   * This is called from content script on the main app's domain
   */
  static getTokenFromPage() {
    try {
      // Try to get from localStorage (Supabase stores it here)
      // Supabase typically stores auth in a key like: sb-<project-ref>-auth-token
      const allKeys = Object.keys(localStorage);
      const supabaseKey = allKeys.find(key => 
        key.includes('sb-') && key.includes('auth-token')
      ) || 'supabase.auth.token';
      
      const supabaseAuth = localStorage.getItem(supabaseKey) || 
                          localStorage.getItem('supabase.auth.token');
      
      if (supabaseAuth) {
        try {
          const authData = JSON.parse(supabaseAuth);
          // Supabase stores the session object with access_token
          if (authData.access_token) {
            return authData.access_token;
          }
          // Or it might be the session object directly
          if (authData.session?.access_token) {
            return authData.session.access_token;
          }
          return authData;
        } catch {
          return supabaseAuth;
        }
      }

      // Try to get from sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      const sessionKey = sessionKeys.find(key => 
        key.includes('sb-') && key.includes('auth-token')
      ) || 'supabase.auth.token';
      
      const sessionAuth = sessionStorage.getItem(sessionKey) ||
                         sessionStorage.getItem('supabase.auth.token');
      
      if (sessionAuth) {
        try {
          const authData = JSON.parse(sessionAuth);
          if (authData.access_token) {
            return authData.access_token;
          }
          if (authData.session?.access_token) {
            return authData.session.access_token;
          }
          return authData;
        } catch {
          return sessionAuth;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting token from page:', error);
      return null;
    }
  }

  /**
   * Store token in extension storage
   */
  static async storeToken(token) {
    try {
      await chrome.storage.local.set({
        supabase_token: token,
        auth_token: token,
      });
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Get stored token from extension storage
   */
  static async getStoredToken() {
    try {
      const result = await chrome.storage.local.get(['supabase_token', 'auth_token']);
      return result.supabase_token || result.auth_token || null;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }
}

