import { useEffect, useState } from 'react';

export function useTelegram() {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();

        setWebApp(tg);
        setUser(tg.initDataUnsafe?.user);
        setInitData(tg.initData || '');

        // Встановлюємо параметри теми
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams?.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams?.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor || '#ffffff');
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    }
  }, []);

  const openLink = (url) => {
    try {
      if (webApp) {
        webApp.openLink(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      window.open(url, '_blank');
    }
  };

  return { webApp, user, initData, openLink };
}

// Для підтримки default імпорту
export default useTelegram;