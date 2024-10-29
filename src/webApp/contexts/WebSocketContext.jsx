// src/webApp/contexts/WebSocketContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const { addNotification } = useNotification();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(process.env.REACT_APP_WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setReconnectAttempt(0);
        addNotification('success', 'З\'єднання встановлено');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Спроба перепідключення
        if (reconnectAttempt < 5) {
          setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connect();
          }, 5000); // Спроба кожні 5 секунд
        } else {
          addNotification('error', 'Не вдалося відновити з\'єднання');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addNotification('error', 'Помилка з\'єднання');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Створюємо кастомну подію для компонентів
          const customEvent = new CustomEvent('ws_message', {
            detail: data
          });
          window.dispatchEvent(customEvent);

          // Обробка системних повідомлень
          if (data.type === 'system') {
            switch (data.action) {
              case 'maintenance':
                addNotification('warning', 'Планове технічне обслуговування');
                break;
              case 'error':
                addNotification('error', data.message);
                break;
              default:
                break;
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      setSocket(ws);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      addNotification('error', 'Помилка підключення до сервера');
    }
  }, [addNotification, reconnectAttempt]);

  // Початкове підключення
  useEffect(() => {
    connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  // Методи для роботи з WebSocket
  const sendMessage = useCallback((type, data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket]);

  const subscribe = useCallback((channel) => {
    sendMessage('subscribe', { channel });
  }, [sendMessage]);

  const unsubscribe = useCallback((channel) => {
    sendMessage('unsubscribe', { channel });
  }, [sendMessage]);

  return (
    <WebSocketContext.Provider 
      value={{ 
        connected,
        sendMessage,
        subscribe,
        unsubscribe
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};