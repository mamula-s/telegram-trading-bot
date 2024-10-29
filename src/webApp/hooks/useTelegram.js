import { useEffect, useState, useCallback } from 'react';

const useTelegram = () => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) {
      console.warn('Telegram WebApp is not available');
      return;
    }

    try {
      // Встановлюємо теми
      const themeParams = tg.themeParams || {};
      Object.entries(themeParams).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--tg-theme-${key}`, value);
      });

      setUser(tg.initDataUnsafe?.user || null);
      tg.ready();
      tg.expand();
      setReady(true);
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
    }
  }, [tg]);

  const showAlert = useCallback((message) => {
    if (tg) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  }, [tg]);

  const showConfirm = useCallback((message) => {
    if (tg) {
      return new Promise((resolve) => {
        tg.showConfirm(message, resolve);
      });
    }
    return Promise.resolve(window.confirm(message));
  }, [tg]);

  const hapticFeedback = useCallback((style = 'medium') => {
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred(style);
      } catch (error) {
        // Ігноруємо помилку, якщо haptic feedback не підтримується
      }
    }
  }, [tg]);

  const openLink = useCallback((url) => {
    if (tg) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, [tg]);

  return {
    ready,
    user,
    showAlert,
    showConfirm,
    hapticFeedback,
    openLink,
    initData: tg?.initData || ''
  };
};

export default useTelegram;