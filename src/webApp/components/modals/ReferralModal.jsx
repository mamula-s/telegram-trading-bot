import React from 'react';
import { 
  Users, 
  Copy, 
  Share2, 
  Gift, 
  TrendingUp, 
  CheckCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import Modal from '../Modal';
import { useNotification } from '../../contexts/NotificationContext';

const ReferralModal = ({
  isOpen,
  onClose,
  referralData,
  onInvite
}) => {
  const { addNotification } = useNotification();

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification('success', 'Посилання скопійовано');
    } catch (error) {
      addNotification('error', 'Помилка при копіюванні');
    }
  };

  const shareReferralLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Trading Bot - Реферальна програма',
          text: 'Приєднуйся до Trading Bot та отримай бонус!',
          url: referralData?.referralLink
        });
      } else {
        await copyToClipboard(referralData?.referralLink);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Реферальна програма"
      size="large"
    >
      <div className="divide-y">
        {/* Header Stats */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-blue-600">
                <Users className="w-5 h-5" />
                <span className="text-sm">Ваші реферали</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-blue-700">
                  {referralData?.totalReferrals || 0}
                </div>
                <div className="text-sm text-blue-600">
                  {referralData?.activeReferrals || 0} активних
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-green-600">
                <Gift className="w-5 h-5" />
                <span className="text-sm">Зароблено</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-green-700">
                  ${referralData?.totalEarned || 0}
                </div>
                <div className="text-sm text-green-600">
                  ${referralData?.pendingRewards || 0} очікується
                </div>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-3">
            <h3 className="font-semibold">Ваше реферальне посилання</h3>
            <div className="relative">
              <input
                type="text"
                value={referralData?.referralLink}
                readOnly
                className="w-full bg-gray-50 p-3 pr-24 rounded-xl text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  onClick={() => copyToClipboard(referralData?.referralLink)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={shareReferralLink}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="p-4">
          <h3 className="font-semibold mb-4">Винагороди</h3>
          <div className="grid gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-xl text-white">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6" />
                <div>
                  <h4 className="font-semibold">Для ваших друзів</h4>
                  <p className="opacity-90">30% знижка на першу підписку</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-green-400 p-4 rounded-xl text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                <div>
                  <h4 className="font-semibold">Для вас</h4>
                  <p className="opacity-90">20% від платежів реферала</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="p-4">
          <h3 className="font-semibold mb-4">Як це працює</h3>
          <div className="space-y-4">
            {[
              {
                title: 'Запросіть друзів',
                description: 'Поділіться своїм реферальним посиланням'
              },
              {
                title: 'Вони отримують знижку',
                description: '30% знижка на першу підписку'
              },
              {
                title: 'Ви отримуєте винагороду',
                description: '20% від кожного платежу протягом 6 місяців'
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Referrals */}
        {referralData?.recentReferrals?.length > 0 && (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Останні реферали</h3>
            <div className="space-y-3">
              {referralData.recentReferrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {referral.username?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{referral.username}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-medium">
                      +${referral.earned}
                    </div>
                    <div className="text-sm text-gray-500">{referral.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-3">
          <button
            onClick={onInvite}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Запросити друзів
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReferralModal;