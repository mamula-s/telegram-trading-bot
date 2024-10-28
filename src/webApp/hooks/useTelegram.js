import { useEffect, useCallback } from 'react';

const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  const showAlert = useCallback((message) => {
    if (tg) {
      tg.showAlert(message);
    }
  }, [tg]);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      if (tg) {
        tg.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      } else {
        resolve(window.confirm(message));
      }
    });
  }, [tg]);

  const closeWebApp = useCallback(() => {
    if (tg) {
      tg.close();
    }
  }, [tg]);

  const openLink = useCallback((url) => {
    if (tg) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, [tg]);

  const getUserData = useCallback(() => {
    if (tg) {
      return tg.initDataUnsafe?.user || null;
    }
    return null;
  }, [tg]);

  return {
    tg,
    user: getUserData(),
    showAlert,
    showConfirm,
    closeWebApp,
    openLink
  };
};

export default useTelegram;