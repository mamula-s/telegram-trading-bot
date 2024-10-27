import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    // Ініціалізація Telegram WebApp
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Встановлюємо кольори теми
    if (tg) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
      document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b z-50">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="flex items-center h-14">
            {window.location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-lg font-semibold ml-2">
              Trading Bot
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;