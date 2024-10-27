import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Layout = ({ children, showBackButton = false, title = '' }) => {
  const navigate = useNavigate();
  const tg = window.Telegram.WebApp;

  // Встановлюємо колір теми Telegram
  React.useEffect(() => {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 bg-blue-600 text-white p-4 flex items-center gap-4 z-50">
        {showBackButton && (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        {title && <h1 className="text-xl font-bold">{title}</h1>}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="h-16"></div>
    </div>
  );
};

export default Layout;