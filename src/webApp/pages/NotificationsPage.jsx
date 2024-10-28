import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  TrendingUp, 
  MessageCircle, 
  Gift, 
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Trash2,
  MoreVertical
} from 'lucide-react';
import Card from '../components/Card';
import { useApi } from '../contexts/ApiContext';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/Loading';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/modals/ConfirmModal';

const NotificationsPage = () => {
  const { fetchApi, isLoading } = useApi();
  const { addNotification } = useNotification();
  
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'signals', 'news'
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = async () => {
    try {
      const response = await fetchApi(`notifications?type=${activeTab}`);
      setNotifications(response.notifications);
    } catch (error) {
      setError('Помилка завантаження сповіщень');
      addNotification('error', 'Не вдалося завантажити сповіщення');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetchApi(`notifications/${notificationId}/read`, { method: 'POST' });
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      addNotification('error', 'Помилка при позначенні сповіщення');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetchApi('notifications/read-all', { method: 'POST' });
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          isRead: true
        }))
      );
      addNotification('success', 'Всі сповіщення позначено прочитаними');
    } catch (error) {
      addNotification('error', 'Помилка при позначенні сповіщень');
    }
  };

  const handleClearAll = async () => {
    try {
      await fetchApi('notifications/clear-all', { method: 'DELETE' });
      setNotifications([]);
      setShowClearConfirm(false);
      addNotification('success', 'Всі сповіщення видалено');
    } catch (error) {
      addNotification('error', 'Помилка при видаленні сповіщень');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await fetchApi(`notifications/${notificationId}`, { method: 'DELETE' });
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
      addNotification('success', 'Сповіщення видалено');
    } catch (error) {
      addNotification('error', 'Помилка при видаленні сповіщення');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'signal':
        return <TrendingUp className="w-6 h-6 text-blue-500" />;
      case 'message':
        return <MessageCircle className="w-6 h-6 text-green-500" />;
      case 'promo':
        return <Gift className="w-6 h-6 text-purple-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Info className="w-6 h-6 text-gray-500" />;
    }
  };

  if (error) {
    return <ErrorView message={error} onRetry={loadNotifications} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Сповіщення</h1>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        <p className="opacity-90">
          {notifications.filter(n => !n.isRead).length} нових сповіщень
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto py-2 -mx-4 px-4 space-x-2">
        {[
          { id: 'all', name: 'Всі' },
          { id: 'unread', name: 'Непрочитані' },
          { id: 'signals', name: 'Сигнали' },
          { id: 'news', name: 'Новини' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <Loading text="Завантаження сповіщень..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Немає сповіщень"
          description="У вас поки немає сповіщень"
          icon={Bell}
        />
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card
              key={notification.id}
              className={`relative transition-all ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className="shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium line-clamp-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Позначити прочитаним
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setSelectedNotification(notification)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Settings Button */}
      <div className="fixed bottom-24 right-4">
        <button
          onClick={() => {/* Navigate to notification settings */}}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Settings className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Confirm Clear Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Видалити всі сповіщення"
        message="Ви впевнені, що хочете видалити всі сповіщення? Цю дію неможливо скасувати."
        confirmText="Видалити все"
        type="error"
      />
    </div>
  );
};

export default NotificationsPage;