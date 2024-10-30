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
      // Add retry logic
      const maxRetries = 3;
      let attempt = 0;
      let lastError;

      while (attempt < maxRetries) {
        try {
          const response = await fetch(`/api/${endpoint}`, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'X-Telegram-Init-Data': initData,
              ...options.headers,
            },
          });

          if (response.status === 401) {
            const error = await response.json();
            if (error.code === 'NO_INIT_DATA') {
              // Wait for initData to be available
              await new Promise(resolve => setTimeout(resolve, 1000));
              attempt++;
              continue;
            }
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          lastError = error;
          if (attempt === maxRetries - 1) throw error;
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      throw lastError;
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