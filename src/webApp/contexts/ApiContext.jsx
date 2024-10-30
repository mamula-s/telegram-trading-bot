import React, { createContext, useContext, useState } from 'react';

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

  const fetchApi = async (endpoint, options = {}) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiContext.Provider value={{ fetchApi, isLoading }}>
      {children}
    </ApiContext.Provider>
  );
};