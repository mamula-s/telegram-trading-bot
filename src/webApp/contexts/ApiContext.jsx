// src/webApp/contexts/ApiContext.js
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = {
    loading,
    error,
    // Ваші методи API
    fetchData: async (url) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};