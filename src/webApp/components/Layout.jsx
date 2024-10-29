import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Home, 
  TrendingUp, 
  BarChart2, 
  BookOpen, 
  Users, 
  Gift,
  MessageCircle, 
  CreditCard
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [webApp, setWebApp] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        setWebApp(tg);
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Захист від несанкціонованого доступу
  useEffect(() => {
    if (isInitialized && !window.Telegram?.WebApp) {
      window.location.href = 'https://t.me/your_bot_username';
    }
  }, [isInitialized]);

  const navItems = [
    { 
      path: '/futures', 
      icon: <TrendingUp className="w-5 h-5" />, 
      label: "Ф'ючерси" 
    },
    { 
      path: '/spot', 
      icon: <BarChart2 className="w-5 h-5" />, 
      label: "Спот" 
    },
    { 
      path: '/education', 
      icon: <BookOpen className="w-5 h-5" />, 
      label: "Навчання" 
    },
    { 
      path: '/airdrops', 
      icon: <Gift className="w-5 h-5" />, 
      label: "Аірдропи" 
    },
    { 
      path: '/chats', 
      icon: <MessageCircle className="w-5 h-5" />, 
      label: "Чати" 
    }
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Trading Bot';
      case '/futures':
        return "Ф'ючерсні сигнали";
      case '/spot':
        return "Спотові сигнали";
      case '/education':
        return "Навчальні матеріали";
      case '/referral':
        return "Реферальна програма";
      case '/airdrops':
        return "Аірдропи та огляди";
      case '/chats':
        return "Чати";
      case '/payment':
        return "Підписка";
      default:
        return 'Trading Bot';
    }
  };

  const handleNavigation = (path) => {
    if (webApp) {
      try {
        webApp.HapticFeedback.impactOccurred('light');
      } catch (error) {
        console.error('Error with haptic feedback:', error);
      }
    }

    if (typeof path === 'number') {
      navigate(path);
    } else {
      navigate(path);
    }
  };

  // MainButton handling
  useEffect(() => {
    if (webApp) {
      if (location.pathname === '/payment') {
        webApp.MainButton.setText('ОФОРМИТИ ПІДПИСКУ');
        webApp.MainButton.show();
        webApp.MainButton.onClick(() => {
          // Логіка оформлення підписки
        });
      } else {
        webApp.MainButton.hide();
      }

      return () => {
        webApp.MainButton.hide();
        webApp.MainButton.offClick();
      };
    }
  }, [webApp, location.pathname]);

  // BackButton handling
  useEffect(() => {
    if (webApp) {
      if (!isHomePage) {
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => navigate(-1));
      } else {
        webApp.BackButton.hide();
      }

      return () => {
        webApp.BackButton.hide();
        webApp.BackButton.offClick();
      };
    }
  }, [webApp, isHomePage, navigate]);

  // Встановлюємо theme_params
  useEffect(() => {
    if (webApp) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color);
      document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color);
      document.documentElement.style.setProperty('--tg-theme-hint-color', webApp.themeParams.hint_color);
      document.documentElement.style.setProperty('--tg-theme-link-color', webApp.themeParams.link_color);
      document.documentElement.style.setProperty('--tg-theme-button-color', webApp.themeParams.button_color);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', webApp.themeParams.button_text_color);
    }
  }, [webApp]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color,#f5f5f5)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[var(--tg-theme-bg-color,#ffffff)] border-b z-50">
        <div className="flex items-center h-14 px-4">
          {!isHomePage && (
            <button 
              onClick={() => handleNavigation(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {isHomePage ? (
            <div className="flex items-center justify-between w-full">
              <h1 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">Trading Bot</h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleNavigation('/referral')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Users className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleNavigation('/payment')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={() => handleNavigation('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <h1 className="ml-3 text-lg font-semibold text-[var(--tg-theme-text-color)]">{getPageTitle()}</h1>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--tg-theme-bg-color,#ffffff)] border-t">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-3">
            {navItems.map((item) => (
              <button 
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`text-sm flex flex-col items-center gap-1 ${
                  location.pathname === item.path 
                    ? 'text-[var(--tg-theme-link-color,#2481cc)]'
                    : 'text-[var(--tg-theme-hint-color,#999999)]'
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* iOS Safe Area Bottom Spacing */}
      <div className="h-safe-bottom bg-[var(--tg-theme-bg-color,#ffffff)]" />
    </div>
  );
};

export default Layout;