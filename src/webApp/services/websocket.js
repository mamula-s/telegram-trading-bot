// src/webApp/services/websocket.js
class WebSocketService {
    constructor() {
      this.ws = null;
      this.subscribers = new Map();
    }
  
    connect() {
      this.ws = new WebSocket(`${process.env.WS_URL}/webapp`);
  
      this.ws.onmessage = (event) => {
        const { event: eventName, data } = JSON.parse(event.data);
        
        // Сповіщаємо підписників про оновлення
        if (this.subscribers.has(eventName)) {
          this.subscribers.get(eventName).forEach(callback => callback(data));
        }
      };
  
      this.ws.onclose = () => {
        // Перепідключення при розриві
        setTimeout(() => this.connect(), 1000);
      };
    }
  
    subscribe(event, callback) {
      if (!this.subscribers.has(event)) {
        this.subscribers.set(event, new Set());
      }
      this.subscribers.get(event).add(callback);
  
      return () => {
        const callbacks = this.subscribers.get(event);
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(event);
        }
      };
    }
  }
  
  export default new WebSocketService();