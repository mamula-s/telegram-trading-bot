import React, { useState, useEffect } from 'react';
import { 
  User, 
  CreditCard,
  Bell,
  Shield,
  Clock,
  TrendingUp,
  BarChart2,
  Settings,
  ExternalLink,
  ChevronRight,
  Gift,
  LogOut
} from 'lucide-react';
import Card from '../components/Card';
import { useApi } from '../contexts/ApiContext';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/Loading';
import ErrorView from '../components/ErrorView';
import ConfirmModal from '../components/modals/ConfirmModal';
import SubscriptionModal from '../components/modals/SubscriptionModal';
import ReferralModal from '../components/modals/ReferralModal';
import useTelegram from '../hooks/useTelegram';

const ProfilePage = () => {
  const { fetchApi, isLoading } = useApi();
  const { addNotification } = useNotification();
  const { user: tgUser, showConfirm } = useTelegram();
  
  const [profileData, setProfileData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [stats, setStats] = useState({
    totalTrades: 0,
    successRate: 0,
    totalProfit: 0,
    totalSignals: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [profile, statsData] = await Promise.all([
        fetchApi('profile'),
        fetchApi('profile/stats')
      ]);
      setProfileData(profile);
      setStats(statsData);
    } catch (err) {
      setError('Помилка завантаження даних профілю');
      addNotification('error', 'Не вдалося завантажити дані профілю');
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      'Ви впевнені, що хочете вийти з облікового запису?'
    );
    if (confirmed) {
      // Implement logout logic
      addNotification('success', 'Ви успішно вийшли з облікового запису');
    }
  };

  if (error) {
    return <ErrorView message={error} onRetry={loadProfileData} />;
  }

  if (isLoading || !profileData) {
    return <Loading text="Завантаження профілю..." />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {profileData.firstName?.[0] || tgUser?.username?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="opacity-80">@{tgUser?.username}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-sm opacity-80">Успішність</div>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-sm opacity-80">Загальний прибуток</div>
            <div className="text-2xl font-bold">+{stats.totalProfit}%</div>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <Card onClick={() => setShowSubscriptionModal(true)}
            className="cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">
                {profileData.subscriptionType || 'Безкоштовний'} план
              </div>
              <div className="text-sm text-gray-500">
                {profileData.subscriptionActive 
                  ? `Активний до ${new Date(profileData.subscriptionEndDate).toLocaleDateString()}`
                  : 'Немає активної підписки'
                }
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Card>

      {/* Trading Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Всього угод</div>
              <div className="text-lg font-bold">{stats.totalTrades}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-xl">
              <BarChart2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Використано сигналів</div>
              <div className="text-lg font-bold">{stats.totalSignals}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-500">Швидкі дії</div>
        
        <Card onClick={() => setShowReferralModal(true)}
              className="cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-2 rounded-xl">
                <Gift className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium">Запросити друзів</div>
                <div className="text-sm text-gray-500">
                  Отримайте бонус за кожного запрошеного друга
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card onClick={() => window.Telegram?.WebApp?.openTelegramLink?.('https://t.me/support')}
              className="cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Підтримка</div>
                <div className="text-sm text-gray-500">
                  Зв'яжіться з нашою службою підтримки
                </div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card onClick={() => {/* Navigate to settings */}}
              className="cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2 rounded-xl">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <div className="font-medium">Налаштування</div>
                <div className="text-sm text-gray-500">
                  Сповіщення, мова, тема та інше
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
      >
        <div className="flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          <span>Вийти</span>
        </div>
      </button>

      {/* Modals */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        subscription={profileData.subscription}
      />

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        referralData={profileData.referral}
      />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Вийти з облікового запису"
        message="Ви впевнені, що хочете вийти?"
        confirmText="Вийти"
        type="warning"
      />
    </div>
  );
};

export default ProfilePage;