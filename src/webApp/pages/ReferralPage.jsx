import React, { useState, useEffect } from 'react';
import { Users, Copy, Gift, Share2, AlertCircle, ArrowRight } from 'lucide-react';

const ReferralPage = () => {
  const [referralData, setReferralData] = useState({
    referralCode: 'ABC123',
    totalReferrals: 5,
    activeReferrals: 3,
    totalEarned: 150,
    pendingRewards: 50,
    referralLink: 'https://t.me/your_bot?start=ABC123'
  });

  const [referrals, setReferrals] = useState([
    {
      id: 1,
      username: 'user1',
      joinedAt: '2024-02-15T10:00:00Z',
      earned: 50,
      status: 'Active'
    },
    {
      id: 2,
      username: 'user2',
      joinedAt: '2024-02-16T15:30:00Z',
      earned: 30,
      status: 'Active'
    }
  ]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Show success notification
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // TODO: Show error notification
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Реферальна програма</h1>
            <p className="opacity-80">Запрошуйте друзів - отримуйте винагороду</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-sm opacity-80">Всього рефералів</div>
            <div className="text-2xl font-bold">{referralData.totalReferrals}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-sm opacity-80">Зароблено</div>
            <div className="text-2xl font-bold">${referralData.totalEarned}</div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Ваше реферальне посилання</h2>
        <div className="relative">
          <input
            type="text"
            value={referralData.referralLink}
            readOnly
            className="w-full bg-gray-50 p-3 pr-24 rounded-xl text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              onClick={() => copyToClipboard(referralData.referralLink)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Copy className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => window.Telegram?.WebApp?.openLink?.(referralData.referralLink)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="grid gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Gift className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold">Для ваших друзів</h3>
              <p className="text-sm text-gray-600">
                30% знижка на першу підписку
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold">Для вас</h3>
              <p className="text-sm text-gray-600">
                20% від кожного платежу реферала
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Referrals */}
      {referrals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Ваші реферали</h2>
          {referrals.map((referral) => (
            <div 
              key={referral.id}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{referral.username}</div>
                <div className="text-sm text-gray-500">
                  {new Date(referral.joinedAt).toLocaleDateString()}
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
      )}

      {/* Terms */}
      <div className="bg-yellow-50 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-2">Умови програми:</p>
            <ul className="space-y-1">
              <li>Мінімальна сума для виведення: $50</li>
              <li>Виплати раз на тиждень</li>
              <li>Реферальна винагорода діє 6 місяців</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;