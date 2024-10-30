import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Timer, TrendingUp, ExternalLink, Star, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import { useApi } from '../contexts/ApiContext';
import { useTelegram } from '../hooks/useTelegram';
import { useNotification } from '../contexts/NotificationContext';

const AirdropsPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const { fetchApi, isLoading } = useApi();
  const { openLink } = useTelegram();
  const { addNotification } = useNotification();

  // States
  const [airdrops, setAirdrops] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Load data
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'reviews') {
        const data = await fetchApi('airdrops/reviews');
        setReviews(data.reviews || []);
      } else {
        const data = await fetchApi(`airdrops/${activeTab}`);
        setAirdrops(data.airdrops || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification('error', 'Помилка завантаження даних');
    }
  };

  const handleProjectLink = (link) => {
    try {
      openLink(link);
    } catch (error) {
      console.error('Error opening link:', error);
      addNotification('error', 'Помилка при відкритті посилання');
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Аірдропи та Огляди</h1>
        </div>
        <p className="opacity-90">Актуальні аірдропи та огляди проектів</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-hide">
        {['active', 'upcoming', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === 'active' && 'Активні'}
            {tab === 'upcoming' && 'Очікуються'}
            {tab === 'reviews' && 'Огляди'}
          </button>
        ))}
      </div>

      {/* Risk Level Info */}
      {activeTab !== 'reviews' && (
        <Card className="bg-yellow-50 border border-yellow-100">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Рівні ризику:</p>
              <ul className="space-y-1">
                <li>🟢 Низький - безпечні та перевірені проекти</li>
                <li>🟡 Середній - потребує уваги та дослідження</li>
                <li>🔴 Високий - будьте особливо обережні</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab !== 'reviews' ? (
          // Airdrops List
          airdrops.length > 0 ? (
            airdrops.map(airdrop => (
              <Card key={airdrop.id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{airdrop.title}</h3>
                    <p className="text-gray-600">{airdrop.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${getRiskColor(airdrop.riskLevel)}`}>
                    {airdrop.riskLevel === 'low' && 'Низький ризик'}
                    {airdrop.riskLevel === 'medium' && 'Середній ризик'}
                    {airdrop.riskLevel === 'high' && 'Високий ризик'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4 text-gray-400" />
                    <span>{airdrop.status === 'active' ? 'До:' : 'Старт:'}</span>
                    <span className="text-gray-900">
                      {new Date(airdrop.status === 'active' ? airdrop.endDate : airdrop.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-gray-400" />
                    <span>Очікувана винагорода:</span>
                    <span className="text-gray-900">
                      {airdrop.reward || airdrop.expectedReward}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span>Ймовірність:</span>
                    <span className="text-gray-900">{airdrop.probability}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Вимоги:</h4>
                  <ul className="space-y-2">
                    {airdrop.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between pt-2 border-t">
                  <button 
                    onClick={() => addNotification('info', 'Детальна інформація буде доступна незабаром')}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    Детальніше
                  </button>
                  <button 
                    onClick={() => handleProjectLink(airdrop.link)}
                    className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Перейти до проекту
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Аірдропів поки немає
            </div>
          )
        ) : (
          // Reviews List
          reviews.length > 0 ? (
            reviews.map(review => (
              <Card key={review.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{review.title}</h3>
                    <p className="text-gray-600 text-sm">{review.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{review.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>{review.type === 'video' ? '🎥 Відео' : '📄 Стаття'}</span>
                  <span>⏱️ {review.duration}</span>
                  <span>👁️ {review.views} переглядів</span>
                  <span>📅 {new Date(review.publishedAt).toLocaleDateString()}</span>
                </div>

                <button 
                  onClick={() => handleProjectLink(review.link)}
                  className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {review.type === 'video' ? 'Дивитися' : 'Читати'}
                </button>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Оглядів поки немає
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AirdropsPage;