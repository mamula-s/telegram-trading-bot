import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, TrendingUp, BarChart2, BookOpen, Users } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navItems = [
    { path: '/futures', icon: <TrendingUp className="w-5 h-5" />, label: "Ф'ючерси" },
    { path: '/spot', icon: <BarChart2 className="w-5 h-5" />, label: "Спот" },
    { path: '/education', icon: <BookOpen className="w-5 h-5" />, label: "Навчання" },
    { path: '/referral', icon: <Users className="w-5 h-5" />, label: "Реферали" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="flex items-center h-14 px-4">
          {!isHomePage && (
            <button 
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {isHomePage ? (
            <h1 className="text-lg font-semibold">Trading Bot</h1>
          ) : (
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-3">
            {navItems.map((item) => (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm flex flex-col items-center gap-1 ${
                  location.pathname === item.path 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;