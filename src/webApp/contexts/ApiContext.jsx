import React, { createContext, useContext, useState, useCallback } from 'react';
import useTelegram from '../hooks/useTelegram';

const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  const { showAlert, initData } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);

  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Щось пішло не так');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      showAlert(error.message || 'Помилка при виконанні запиту');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, initData]);

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