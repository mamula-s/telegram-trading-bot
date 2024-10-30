import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext();

export const useWebSocket = (channel) => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }

  useEffect(() => {
    if (channel) {
      context.subscribe(channel);
      return () => context.unsubscribe(channel);
    }
  }, [channel, context]);

  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setConnected(false);
      // Спроба перепідключення через 5 секунд
      setTimeout(() => setSocket(null), 5000);
    };

    ws.onmessage = (event) => {
      const customEvent = new CustomEvent('ws_message', { detail: JSON.parse(event.data) });
      window.dispatchEvent(customEvent);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const subscribe = (channel) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  };

  const unsubscribe = (channel) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'unsubscribe', channel }));
    }
  };

  return (
    <WebSocketContext.Provider value={{ connected, subscribe, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};