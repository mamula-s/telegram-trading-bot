import React, { createContext, useContext, useState, useCallback } from 'react';
import useTelegram from '../hooks/useTelegram';

const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  const { user, showAlert } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);

  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-User-Id': user?.id,
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      showAlert(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, showAlert]);

  return (
    <ApiContext.Provider value={{ fetchApi, isLoading }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};