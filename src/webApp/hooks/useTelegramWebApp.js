// src/webApp/hooks/useTelegramWebApp.js
import { useEffect, useState } from 'react';

export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        setWebApp(tg);
        setUser(tg.initDataUnsafe?.user || null);
      } else {
        setError(new Error('Telegram WebApp is not available'));
      }
    } catch (err) {
      setError(err);
      console.error('Error initializing Telegram WebApp:', err);
    }
  }, []);

  return { webApp, user, error };
};