import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
            <button 
              onClick={() => navigate('/futures')}
              className="text-sm text-gray-600 flex flex-col items-center"
            >
              <span>Ф'ючерси</span>
            </button>
            <button 
              onClick={() => navigate('/spot')}
              className="text-sm text-gray-600 flex flex-col items-center"
            >
              <span>Спот</span>
            </button>
            <button 
              onClick={() => navigate('/education')}
              className="text-sm text-gray-600 flex flex-col items-center"
            >
              <span>Навчання</span>
            </button>
            <button 
              onClick={() => navigate('/referral')}
              className="text-sm text-gray-600 flex flex-col items-center"
            >
              <span>Реферали</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;