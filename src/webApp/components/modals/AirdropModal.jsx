import React from 'react';
import { 
  Gift, 
  ExternalLink, 
  Calendar, 
  Timer, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Globe,
  TwitterIcon,
  Copy,
  Share2
} from 'lucide-react';
import Modal from '../Modal';
import { useNotification } from '../../contexts/NotificationContext';

const AirdropModal = ({ 
  isOpen, 
  onClose, 
  airdrop,
  onParticipate
}) => {
  const { addNotification } = useNotification();

  if (!airdrop) return null;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification('success', 'Скопійовано в буфер обміну');
    } catch (error) {
      addNotification('error', 'Помилка при копіюванні');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Інформація про аірдроп"
      size="large"
    >
      <div className="divide-y">
        {/* Header Info */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{airdrop.title}</h2>
              <p className="text-gray-600 mt-1">{airdrop.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${getRiskColor(airdrop.riskLevel)}`}>
              {airdrop.riskLevel === 'low' && 'Низький ризик'}
              {airdrop.riskLevel === 'medium' && 'Середній ризик'}
              {airdrop.riskLevel === 'high' && 'Високий ризик'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Дата старту</span>
              </div>
              <div className="font-medium mt-1">
                {new Date(airdrop.startDate).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Дата закінчення</span>
              </div>
              <div className="font-medium mt-1">
                {new Date(airdrop.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex gap-3">
              <Gift className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-blue-700 font-medium">Очікувана винагорода:</p>
                <p className="text-blue-600 mt-1">{airdrop.reward}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="p-4">
          <h3 className="font-semibold mb-3">Вимоги:</h3>
          <div className="space-y-3">
            {airdrop.requirements.map((req, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl"
              >
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Links */}
        <div className="p-4">
          <h3 className="font-semibold mb-3">Посилання:</h3>
          <div className="grid gap-2">
            {airdrop.website && (
              <a
                href={airdrop.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span>Веб-сайт</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            )}
            {airdrop.twitter && (
              <a
                href={airdrop.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <TwitterIcon className="w-5 h-5 text-gray-500" />
                  <span>Twitter</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="p-4">
          <h3 className="font-semibold mb-3">Статистика:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-sm text-gray-500">Учасників</div>
              <div className="font-medium mt-1">{airdrop.participants.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-sm text-gray-500">Ймовірність</div>
              <div className="font-medium mt-1">{airdrop.probability}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-sm text-gray-500">Категорія</div>
              <div className="font-medium mt-1">{airdrop.category}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-3">
          <button
            onClick={() => onParticipate(airdrop.id)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Взяти участь
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => copyToClipboard(window.location.href)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Копіювати посилання
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: airdrop.title,
                    text: airdrop.description,
                    url: window.location.href
                  });
                } else {
                  copyToClipboard(window.location.href);
                }
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Поділитися
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4">
          <div className="bg-yellow-50 p-4 rounded-xl">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <p className="text-yellow-700 font-medium">Важлива інформація:</p>
                <ul className="mt-2 space-y-1 text-sm text-yellow-600">
                  <li>• Перевіряйте всі посилання перед використанням</li>
                  <li>• Не надсилайте кошти на незнайомі адреси</li>
                  <li>• Будьте обережні з підключенням гаманця</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AirdropModal;