import { useEffect, useState, useCallback } from 'react';

const useTelegram = () => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) {
      console.warn('Telegram WebApp is not available');
      return;
    }

    try {
      setInitData(tg.initData || '');
      setUser(tg.initDataUnsafe?.user || null);
      
      // Налаштування теми
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
      document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.secondaryBackgroundColor);

      // Налаштування додатку
      tg.ready();
      tg.expand();
      setReady(true);
      
      // Додаємо хендлер для події закриття
      tg.enableClosingConfirmation();
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
        tg.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      });
    }
    return Promise.resolve(window.confirm(message));
  }, [tg]);

  const hapticFeedback = useCallback((style) => {
    if (tg?.HapticFeedback) {
      switch (style) {
        case 'light':
          tg.HapticFeedback.impactOccurred('light');
          break;
        case 'medium':
          tg.HapticFeedback.impactOccurred('medium');
          break;
        case 'heavy':
          tg.HapticFeedback.impactOccurred('heavy');
          break;
        case 'rigid':
          tg.HapticFeedback.impactOccurred('rigid');
          break;
        case 'soft':
          tg.HapticFeedback.impactOccurred('soft');
          break;
        default:
          tg.HapticFeedback.impactOccurred('medium');
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

  const openTelegramLink = useCallback((url) => {
    if (tg) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, [tg]);

  const close = useCallback(() => {
    if (tg) {
      tg.close();
    }
  }, [tg]);

  return {
    tg,
    ready,
    user,
    initData,
    showAlert,
    showConfirm,
    hapticFeedback,
    openLink,
    openTelegramLink,
    close
  };
};

export default useTelegram;