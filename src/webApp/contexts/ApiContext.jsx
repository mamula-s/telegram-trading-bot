// src/webApp/contexts/ApiContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import useTelegram from '../hooks/useTelegram';

const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  const { user, showAlert } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);

  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      setIsLoading(true);
      // Отримуємо initData від Telegram WebApp
      const webAppData = window.Telegram?.WebApp?.initData;
      
      const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `WebApp ${webAppData}`,
          ...options.headers
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Перенаправляємо на сторінку логіну якщо не авторизовані
          window.location.href = '/admin/login';
          return;
        }
        const error = await response.json();
        throw new Error(error.message || 'Щось пішло не так');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  return (
    <ApiContext.Provider value={{ fetchApi, isLoading }}>
      {children}
    </ApiContext.Provider>
  );
};