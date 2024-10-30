import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();

        // Get init data
        const initDataRaw = tg.initData || '';
        setInitData(initDataRaw);

        // Get user data
        const userData = tg.initDataUnsafe?.user;
        setUser(userData);

        setWebApp(tg);
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    }
  }, []);

  const navigate = (path) => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred('light');
    }
  };

  return {
    webApp,
    user,
    initData,
    navigate
  };
};