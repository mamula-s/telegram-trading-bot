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

    const handleReady = () => {
      setReady(true);
      setUser(tg.initDataUnsafe?.user);
    };

    tg.ready();
    handleReady();

    // Set theme colors
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);

    // Enable haptic feedback
    tg.enableClosingConfirmation();
    tg.setHeaderColor('bg_color');
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

  const showPopup = useCallback((params) => {
    if (tg) {
      return new Promise((resolve) => {
        tg.showPopup(params, (buttonId) => {
          resolve(buttonId);
        });
      });
    }
    return Promise.resolve(null);
  }, [tg]);

  const hapticImpact = useCallback((style = 'medium') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
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

  const expandApp = useCallback(() => {
    if (tg) {
      tg.expand();
    }
  }, [tg]);

  const closeApp = useCallback(() => {
    if (tg) {
      tg.close();
    }
  }, [tg]);

  return {
    ready,
    user,
    showAlert,
    showConfirm,
    showPopup,
    hapticImpact,
    openLink,
    openTelegramLink,
    expandApp,
    closeApp
  };
};

export default useTelegram;