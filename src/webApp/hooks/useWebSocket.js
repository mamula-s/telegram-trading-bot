// src/webApp/hooks/useWebSocket.js
import { useEffect, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const useWebSocket = (endpoint) => {
  const { addNotification } = useNotification();
  
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`${process.env.WS_URL}${endpoint}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Спробуємо перепідключитись через 5 секунд
        setTimeout(connect, 5000);
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      addNotification('error', 'Помилка підключення до WebSocket');
    }
  }, [endpoint, addNotification]);

  useEffect(() => {
    const ws = connect();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);
};

export default useWebSocket;