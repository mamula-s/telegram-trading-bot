import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  BookOpen, 
  Gift, 
  Users, 
  ChevronRight,
  Bell
} from 'lucide-react';
import Layout from '../components/Layout';

const MainPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'User',
    balance: 0,
    profitToday: 0,
    totalProfit: 0,
    subscription: 'FREE'
  });

  const [notifications, setNotifications] = useState(2);

  const menuItems = [
    {
      title: "Ф'ючерсні сигнали",
      icon: <TrendingUp className="w-6 h-6" />,
      stats: "85% успішність",
      path: "/futures"
    },
    {
      title: "Спотові сигнали",
      icon: <TrendingUp className="w-6 h-6" />,
      stats: "92% успішність",
      path: "/spot"
    },
    {
      title: "Навчальні матеріали",
      icon: <BookOpen className="w-6 h-6" />,
      stats: "12 нових уроків",
      path: "/education"
    },
    {
      title: "Огляди та аірдропи",
      icon: <Gift className="w-6 h-6" />,
      stats: "4 нових огляди",
      path: "/airdrops"
    },
    {
      title: "Реферальна програма",
      icon: <Users className="w-6 h-6" />,
      stats: "Запроси друзів",
      path: "/referral"
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user-profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Layout>
      {/* Portfolio Stats */}
      <div className="bg-blue-600 text-white p-4 -mx-4 -mt-6 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{userData.name}</h1>
          <div className="relative">
            <Bell className="w-6 h-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5" />
            <span className="text-sm opacity-75">Баланс портфелю</span>
          </div>
          <div className="text-2xl font-bold">${userData.balance.toLocaleString()}</div>
          <div className="mt-2 text-sm">
            <span className={`${userData.profitToday >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {userData.profitToday > 0 ? '+' : ''}{userData.profitToday}% сьогодні
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-xl">
                  {item.icon}
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.stats}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mt-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-4 text-white">
          <div className="text-sm opacity-75">Ваша підписка</div>
          <div className="text-xl font-bold mt-1">{userData.subscription}</div>
          <button 
            onClick={() => navigate('/referral')}
            className="mt-3 bg-white text-blue-600 px-4 py-2 rounded-xl font-medium"
          >
            Покращити
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default MainPage;