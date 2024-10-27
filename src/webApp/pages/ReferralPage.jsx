import React, { useState, useEffect } from 'react';
import { Users, Copy, Gift, Share2, AlertCircle } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const ReferralPage = () => {
  const { addNotification } = useNotification();
  const [referralData, setReferralData] = useState({
    referralCode: '',
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
    referralLink: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/referral/data');
      const data = await response.json();
      setReferralData(data.referralData);
      setReferrals(data.referrals);
    } catch (error) {
      console.error('Error loading referral data:', error);
      addNotification('error', 'Помилка завантаження даних рефералів');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification('success', 'Скопійовано в буфер обміну');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      addNotification('error', 'Помилка копіювання');
    }
  };

  const shareReferralLink = async () => {
    try {
      const shareData = {
        title: 'Trading Signals Bot',
        text: 'Приєднуйтесь до Trading Signals Bot та отримайте бонус за реєстрацію!',
        url: referralData.referralLink
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        addNotification('success', 'Посилання надіслано');
      } else {
        await copyToClipboard(referralData.referralLink);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      addNotification('error', 'Помилка при спробі поділитися');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Всього рефералів</div>
          <div className="text-2xl font-bold">{referralData.totalReferrals}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Активні реферали</div>
          <div className="text-2xl font-bold text-green-500">{referralData.activeReferrals}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Зароблено всього</div>
          <div className="text-2xl font-bold">${referralData.totalEarned}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Очікує виплати</div>
          <div className="text-2xl font-bold">${referralData.pendingRewards}</div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Ваше реферальне посилання</h2>
        <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
          <div className="flex-1 font-medium text-gray-600 truncate">
            {referralData.referralLink || 'Завантаження...'}
          </div>
          <button
            onClick={() => copyToClipboard(referralData.referralLink)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Copy className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={shareReferralLink}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Реферальна програма</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-900">Для рефералів</h3>
            </div>
            <p className="text-blue-700">
              Отримайте 30% знижку на першу підписку при реєстрації за реферальним посиланням
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-green-900">Для вас</h3>
            </div>
            <p className="text-green-700">
              Отримуйте 20% від кожної оплати ваших рефералів протягом 6 місяців
            </p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-yellow-50 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium mb-1">Умови реферальної програми:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Реферальні бонуси нараховуються тільки за першу активну підписку реферала</li>
            <li>Мінімальна сума для виведення коштів: $50</li>
            <li>Виплати здійснюються протягом 3 робочих днів</li>
          </ul>
        </div>
      </div>

      {/* Referrals List */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Ваші реферали</h2>
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium">{referral.username}</div>
                  <div className="text-sm text-gray-500">
                    Приєднався: {new Date(referral.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-medium">
                    +${referral.earned}
                  </div>
                  <div className="text-sm text-gray-500">
                    {referral.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralPage;