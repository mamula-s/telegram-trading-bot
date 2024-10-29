// src/webApp/hooks/useTelegram.js
import { useEffect, useCallback } from 'react';

const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      // Встановлюємо кольори теми
      tg.setHeaderColor('bg_color');
      tg.setBackgroundColor('#ffffff');
    }
  }, [tg]);

  const showAlert = useCallback((message) => {
    if (tg?.showPopup) {
      tg.showPopup({
        message,
        buttons: [{ type: 'ok' }]
      });
    } else {
      // Fallback для версій без підтримки showPopup
      alert(message);
    }
  }, [tg]);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    showAlert,
    close: tg?.close,
    expand: tg?.expand
  };
};

export default useTelegram;