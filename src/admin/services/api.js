// src/admin/services/api.js
class AdminAPI {
    static async fetchWithAuth(endpoint, options = {}) {
      const response = await fetch(`/api/admin/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include'
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API Error');
      }
  
      return response.json();
    }
  
    // Users
    static getUsers(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return this.fetchWithAuth(`users?${queryString}`);
    }
  
    static getUser(id) {
      return this.fetchWithAuth(`users/${id}`);
    }
  
    // Signals
    static getSignals(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return this.fetchWithAuth(`signals?${queryString}`);
    }
  
    static createSignal(data) {
      return this.fetchWithAuth('signals', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  
    // Subscriptions
    static getSubscriptions(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return this.fetchWithAuth(`subscriptions?${queryString}`);
    }
  }
  
  export default AdminAPI;