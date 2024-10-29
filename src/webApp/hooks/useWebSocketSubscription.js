// src/webApp/hooks/useWebSocketSubscription.js
import { useEffect, useCallback } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

const useWebSocketSubscription = (channel, onMessage) => {
  const { subscribe, unsubscribe } = useWebSocket();

  const handleMessage = useCallback((event) => {
    const data = event.detail;
    if (data.channel === channel) {
      onMessage(data);
    }
  }, [channel, onMessage]);

  useEffect(() => {
    // Підписуємось на канал
    subscribe(channel);

    // Додаємо обробник повідомлень
    window.addEventListener('ws_message', handleMessage);

    // Відписуємось при розмонтуванні
    return () => {
      unsubscribe(channel);
      window.removeEventListener('ws_message', handleMessage);
    };
  }, [channel, subscribe, unsubscribe, handleMessage]);
};

export default useWebSocketSubscription;