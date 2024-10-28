import React from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  BookOpen,
  MessageCircle,
  Gift,
  Zap,
  ArrowRight,
  Shield
} from 'lucide-react';
import Modal from '../Modal';
import { useNotification } from '../../contexts/NotificationContext';

const SubscriptionModal = ({
  isOpen,
  onClose,
  subscription,
  onUpgrade,
  onRenew,
  onCancel
}) => {
  const { addNotification } = useNotification();

  const features = {
    'BASIC': [
      { icon: <TrendingUp />, text: 'Спотові сигнали' },
      { icon: <BookOpen />, text: 'Базові навчальні матеріали' },
      { icon: <MessageCircle />, text: 'Доступ до загального чату' }
    ],
    'PRO': [
      { icon: <TrendingUp />, text: "Ф'ючерсні та спотові сигнали" },
      { icon: <BookOpen />, text: 'Повний доступ до навчальних матеріалів' },
      { icon: <MessageCircle />, text: 'VIP чат з аналітиками' },
      { icon: <Gift />, text: 'Пріоритетні сигнали' }
    ],
    'PREMIUM': [
      { icon: <Zap />, text: 'Всі функції PRO підписки' },
      { icon: <MessageCircle />, text: 'Персональні консультації' },
      { icon: <Gift />, text: 'Ексклюзивні аірдропи' },
      { icon: <Clock />, text: '24/7 підтримка' }
    ]
  };

  if (!subscription) return null;

  const isExpiringSoon = subscription.daysLeft <= 7;
  const isExpired = subscription.status === 'expired';

  const handleCancelClick = async () => {
    try {
      const confirmed = window.confirm('Ви впевнені, що хочете скасувати підписку?');
      if (confirmed) {
        await onCancel();
        addNotification('success', 'Підписку успішно скасовано');
        onClose();
      }
    } catch (error) {
      addNotification('error', 'Помилка при скасуванні підписки');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Деталі підписки"
      size="default"
    >
      <div className="divide-y">
        {/* Status Banner */}
        {isExpired ? (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-700 font-medium">Підписка закінчилась</p>
                <p className="text-red-600 text-sm mt-1">
                  Оновіть підписку, щоб отримати доступ до всіх функцій
                </p>
              </div>
            </div>
          </div>
        ) : isExpiringSoon && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-100">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-700 font-medium">
                  Підписка скоро закінчиться
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Залишилось {subscription.daysLeft} днів
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{subscription.plan} План</h3>
              <p className="text-gray-600 text-sm">{subscription.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              subscription.status === 'active' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              {subscription.status === 'active' ? 'Активна' : 'Закінчується'}
            </div>
          </div>

          {/* Subscription Period */}
          <div className="bg-gray-50 p-3 rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Період підписки</span>
            </div>
            <div className="flex justify-between items-baseline">
              <div>
                <div className="font-medium">
                  {new Date(subscription.startDate).toLocaleDateString()} - {' '}
                  {new Date(subscription.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-lg font-bold">
                ${subscription.price}/міс
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {subscription.status === 'active' && (
            <div className="bg-blue-50 p-3 rounded-xl">
              <div className="flex gap-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-blue-700 font-medium">Наступний платіж</p>
                  <p className="text-blue-600 text-sm mt-1">
                    {new Date(subscription.nextPaymentDate).toLocaleDateString()} • ${subscription.price}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="p-4">
          <h3 className="font-semibold mb-3">Включені функції</h3>
          <div className="space-y-3">
            {features[subscription.plan].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  {React.cloneElement(feature.icon, { size: 18 })}
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Upgrades */}
        {subscription.availableUpgrades && subscription.status === 'active' && (
          <div className="p-4">
            <h3 className="font-semibold mb-3">Доступні покращення</h3>
            <div className="space-y-3">
              {subscription.availableUpgrades.map((upgrade, index) => (
                <button
                  key={index}
                  onClick={() => onUpgrade(upgrade.plan)}
                  className="w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{upgrade.plan} План</div>
                      <div className="text-sm text-gray-500">+{upgrade.additionalFeatures} функцій</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">${upgrade.price}/міс</div>
                    <div className="text-sm text-gray-500">Економія {upgrade.savings}%</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-3">
          {subscription.status === 'active' ? (
            <>
              {subscription.plan !== 'PREMIUM' && (
                <button
                  onClick={() => onUpgrade()}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  Покращити план
                </button>
              )}
              <button
                onClick={handleCancelClick}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Скасувати підписку
              </button>
            </>
          ) : (
            <button
              onClick={() => onRenew()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Оновити підписку
            </button>
          )}
        </div>

        {/* Security Note */}
        <div className="p-4">
          <div className="flex gap-3 text-sm text-gray-500">
            <Shield className="w-5 h-5" />
            <p>
              Ви можете скасувати підписку в будь-який момент. 
              Гарантія повернення коштів протягом 7 днів.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;