import React from 'react';
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
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
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
              <h1 className="text-lg font-semibold">Trading Bot</h1>
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
              <h1 className="ml-3 text-lg font-semibold">{getPageTitle()}</h1>
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-3">
            {navItems.map((item) => (
              <button 
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`text-sm flex flex-col items-center gap-1 ${
                  location.pathname === item.path 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
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
      <div className="h-safe-bottom bg-white" />
    </div>
  );
};

export default Layout;