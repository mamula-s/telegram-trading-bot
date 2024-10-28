import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  Moon, 
  Smartphone,
  LogOut,
  ChevronRight,
  Gift,
  Users
} from 'lucide-react';
import Card from '../components/Card';
import SubscriptionModal from '../components/modals/SubscriptionModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { useNotification } from '../contexts/NotificationContext';
import { useApi } from '../contexts/ApiContext';

const SettingsPage = () => {
  const { addNotification } = useNotification();
  const { fetchApi } = useApi();

  // Стани
  const [subscription, setSubscription] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      signals: true,
      news: true,
      updates: true
    },
    theme: 'light',
    language: 'uk'
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Завантаження даних
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subscriptionData, settingsData] = await Promise.all([
        fetchApi('subscription'),
        fetchApi('settings')
      ]);
      setSubscription(subscriptionData);
      setSettings(settingsData);
    } catch (error) {
      addNotification('error', 'Помилка завантаження налаштувань');
    }
  };

  // Обробники подій
  const handleUpgrade = async () => {
    try {
      await fetchApi('subscription/upgrade', { method: 'POST' });
      addNotification('success', 'Підписку успішно оновлено');
      await loadData();
    } catch (error) {
      addNotification('error', 'Помилка при оновленні підписки');
    }
  };

  const handleCancel = async () => {
    try {
      await fetchApi('subscription/cancel', { method: 'POST' });
      addNotification('success', 'Підписку скасовано');
      await loadData();
    } catch (error) {
      addNotification('error', 'Помилка при скасуванні підписки');
    }
  };

  const handleLogout = () => {
    // Реалізація виходу
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Налаштування</h1>
        </div>
        <p className="opacity-90">
          Керуйте вашим акаунтом та налаштуваннями
        </p>
      </div>

      {/* Subscription Section */}
      <section>
        <h2 className="text-lg font-bold mb-3">Підписка</h2>
        <Card onClick={() => setShowSubscriptionModal(true)}
              className="cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">
                  {subscription?.plan || 'Безкоштовний'} план
                </div>
                <div className="text-sm text-gray-500">
                  {subscription?.status === 'active' 
                    ? `Активна до ${new Date(subscription.endDate).toLocaleDateString()}`
                    : 'Немає активної підписки'
                  }
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </section>

      {/* Notifications Section */}
      <section>
        <h2 className="text-lg font-bold mb-3">Сповіщення</h2>
        <Card className="divide-y">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span>Торгові сигнали</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.signals}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      signals: e.target.checked
                    }
                  }));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          {/* Інші налаштування сповіщень */}
        </Card>
      </section>

      {/* Other Settings */}
      <section>
        <h2 className="text-lg font-bold mb-3">Інші налаштування</h2>
        <Card className="divide-y">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-400" />
              <span>Темна тема</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.theme === 'dark'}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    theme: e.target.checked ? 'dark' : 'light'
                  }));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </Card>
      </section>

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
        subscription={subscription}
        onUpgrade={handleUpgrade}
        onCancel={handleCancel}
      />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Вийти з акаунту"
        message="Ви впевнені, що хочете вийти?"
        confirmText="Вийти"
        type="warning"
      />
    </div>
  );
};

export default SettingsPage;