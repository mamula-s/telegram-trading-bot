// src/webApp/hooks/useRealTimeData.js
import { useState, useEffect, useCallback } from 'react';
import useWebSocketSubscription from './useWebSocketSubscription';

const useRealTimeData = (type, initialData = {}) => {
  const [data, setData] = useState(initialData);

  const handleUpdate = useCallback((message) => {
    switch (message.type) {
      case 'price_update':
        setData(prev => ({
          ...prev,
          prices: {
            ...prev.prices,
            [message.pair]: message.price
          }
        }));
        break;

      case 'stats_update':
        setData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            ...message.stats
          }
        }));
        break;

      case 'portfolio_update':
        setData(prev => ({
          ...prev,
          portfolio: {
            ...prev.portfolio,
            ...message.portfolio
          }
        }));
        break;

      default:
        break;
    }
  }, []);

  useWebSocketSubscription(type, handleUpdate);

  return data;
};

export default useRealTimeData;