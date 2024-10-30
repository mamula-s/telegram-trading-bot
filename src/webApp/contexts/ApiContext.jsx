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
      if (!initData) {
        throw new Error('No init data provided');
      }

      const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
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