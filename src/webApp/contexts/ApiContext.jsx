import React, { createContext, useContext, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { initData } = useTelegram();

  const fetchApi = async (endpoint, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiContext.Provider value={{ 
      fetchApi, 
      isLoading, 
      error,
      clearError: () => setError(null) 
    }}>
      {children}
    </ApiContext.Provider>
  );
};