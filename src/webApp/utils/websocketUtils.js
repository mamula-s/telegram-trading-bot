// src/webApp/utils/websocketUtils.js
export const formatWebSocketMessage = (type, data) => {
    return JSON.stringify({
      type,
      timestamp: new Date().toISOString(),
      data
    });
  };
  
  export const parseWebSocketMessage = (message) => {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      return null;
    }
  };
  
  export const createWebSocketUrl = (endpoint) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_HOST || window.location.host;
    return `${protocol}//${host}/ws${endpoint}`;
  };