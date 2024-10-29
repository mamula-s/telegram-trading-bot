// src/webSocket.js
const WebSocket = require('ws');
const { rateLimiters } = require('./admin/middleware/rateLimiter');

const setupWebSocket = (server) => {
  try {
    const wss = new WebSocket.Server({ server });

    // Зберігаємо екземпляр WSS глобально для можливості закриття при shutdown
    global.wss = wss;

    // Обробка підключення
    wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');

      // Відправка привітання
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Trading Bot WebSocket Server'
      }));

      // Обробка повідомлень
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);

          switch (data.type) {
            case 'subscribe':
              handleSubscribe(ws, data);
              break;
            case 'unsubscribe':
              handleUnsubscribe(ws, data);
              break;
            default:
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
              }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      // Обробка закриття з'єднання
      ws.on('close', () => {
        console.log('Client disconnected');
      });

      // Обробка помилок
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    // Періодична перевірка з'єднань
    const interval = setInterval(() => {
      wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    // Очищення інтервалу при закритті сервера
    wss.on('close', () => {
      clearInterval(interval);
    });

    return wss;
  } catch (error) {
    console.error('WebSocket setup error:', error);
    // Не кидаємо помилку далі, щоб не падав весь сервер
    return null;
  }
};

// Обробники подій
const handleSubscribe = (ws, data) => {
  try {
    const { channel } = data;
    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }
    ws.subscriptions.add(channel);
    
    ws.send(JSON.stringify({
      type: 'subscribed',
      channel
    }));
  } catch (error) {
    console.error('Subscribe error:', error);
  }
};

const handleUnsubscribe = (ws, data) => {
  try {
    const { channel } = data;
    if (ws.subscriptions) {
      ws.subscriptions.delete(channel);
    }
    
    ws.send(JSON.stringify({
      type: 'unsubscribed',
      channel
    }));
  } catch (error) {
    console.error('Unsubscribe error:', error);
  }
};

module.exports = setupWebSocket;