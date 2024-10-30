import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart2, 
  BookOpen, 
  Users, 
  Gift, 
  MessageCircle,
  Wallet,
  Bell
} from 'lucide-react';
import Card from '../components/Card';
import ReferralModal from '../components/modals/ReferralModal';
import { useNotification } from '../contexts/NotificationContext';
import { useApi } from '../contexts/ApiContext';
import { useTelegram } from '../hooks/useTelegram';

const MainPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { fetchApi, isLoading } = useApi();
  const { user } = useTelegram();

  // States
  const [userData, setUserData] = useState({
    name: user?.first_name || 'Користувач',
    balance: 0,
    profitToday: 0,
    totalProfit: 0,
    subscription: 'FREE'
  });
  const [notifications, setNotifications] = useState(0);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralData, setReferralData] = useState(null);

  const menuItems = [
    {
      title: "Ф'ючерсні сигнали",
      description: "Торгові сигнали для ф'ючерсів",
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/futures',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Спотові сигнали',
      description: 'Торгові сигнали для споту',
      icon: <BarChart2 className="w-6 h-6" />,
      path: '/spot',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Навчальні матеріали',
      description: 'База знань по трейдингу',
      icon: <BookOpen className="w-6 h-6" />,
      path: '/education',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Аірдропи',
      description: 'Актуальні аірдропи та огляди',
      icon: <Gift className="w-6 h-6" />,
      path: '/airdrops',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Чати',
      description: 'Спілкування з трейдерами',
      icon: <MessageCircle className="w-6 h-6" />,
      path: '/chats',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, referralInfo, notificationsCount] = await Promise.all([
        fetchApi('user/profile'),
        fetchApi('referral/data'),
        fetchApi('notifications/count')
      ]);

      setUserData(prev => ({
        ...prev,
        ...profileData,
        name: profileData.name || user?.first_name || 'Користувач'
      }));
      setReferralData(referralInfo);
      setNotifications(notificationsCount?.count || 0);
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification('error', 'Помилка завантаження даних');
    }
  };

  const handleInvite = async () => {
    try {
      await fetchApi('referral/invite', { method: 'POST' });
      addNotification('success', 'Запрошення успішно відправлено');
      await loadData();
    } catch (error) {
      console.error('Error sending invite:', error);
      addNotification('error', 'Помилка при відправці запрошення');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header/Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-medium">
              {userData.name?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{userData.name}</h1>
              <div className="text-sm opacity-75">{userData.subscription} план</div>
            </div>
          </div>
          <div className="relative">
            <Bell 
              className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate('/notifications')}
            />
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
            <span className="opacity-75">Баланс портфелю</span>
          </div>
          <div className="text-2xl font-bold">
            ${Number(userData.balance || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-sm">
            <span className={`
              ${userData.profitToday >= 0 ? 'text-green-300' : 'text-red-300'}
            `}>
              {userData.profitToday > 0 ? '+' : ''}{userData.profitToday}% сьогодні
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          onClick={() => navigate('/payment')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="font-medium">Покращити план</div>
              <div className="text-sm text-gray-500">від $49/міс</div>
            </div>
          </div>
        </Card>

        <Card 
          onClick={() => setShowReferralModal(true)}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-medium">Запросити друзів</div>
              <div className="text-sm text-gray-500">+${referralData?.bonus || '0'}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Menu Items */}
      <div className="grid gap-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="w-full bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <h2 className="font-medium">{item.title}</h2>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Referral Modal */}
      {referralData && (
        <ReferralModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          referralData={referralData}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
};

export default MainPage;