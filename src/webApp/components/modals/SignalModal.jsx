import React from 'react';
import { 
  TrendingUp, 
  Timer, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  ChartBar,
  ArrowUpRight,
  ArrowDownRight,
  Copy
} from 'lucide-react';
import Modal from '../Modal';
import { useNotification } from '../../contexts/NotificationContext';

const SignalModal = ({ 
  isOpen, 
  onClose, 
  signal,
  onJoin,
  type = 'futures' // 'futures' або 'spot'
}) => {
  const { addNotification } = useNotification();

  if (!signal) return null;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification('success', 'Скопійовано в буфер обміну');
    } catch (error) {
      addNotification('error', 'Помилка при копіюванні');
    }
  };

  const isProfit = signal.currentPrice > signal.entryPrice;
  const profitPercentage = ((signal.currentPrice - signal.entryPrice) / signal.entryPrice * 100).toFixed(2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${type === 'futures' ? "Ф'ючерсний" : 'Спотовий'} сигнал`}
      size="default"
    >
      <div className="p-4 space-y-6">
        {/* Header Info */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{signal.pair}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                ${signal.direction === 'LONG' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }
              `}>
                {signal.direction === 'LONG' 
                  ? <ArrowUpRight className="w-4 h-4 mr-1" />
                  : <ArrowDownRight className="w-4 h-4 mr-1" />
                }
                {signal.direction}
              </span>
              {type === 'futures' && (
                <span className="text-sm text-gray-500">
                  {signal.leverage}x
                </span>
              )}
            </div>
          </div>
          
          {signal.status === 'ACTIVE' && signal.currentPrice && (
            <div className={`text-right ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              <div className="text-2xl font-bold">
                {isProfit ? '+' : ''}{profitPercentage}%
              </div>
              <div className="text-sm">
                ${signal.currentPrice.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-sm text-gray-500">Ціна входу</div>
            <div className="font-semibold mt-1">
              ${signal.entryPrice.toLocaleString()}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-xl">
            <div className="text-sm text-green-700">Take Profit</div>
            <div className="font-semibold text-green-700 mt-1">
              ${signal.takeProfit.toLocaleString()}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-xl">
            <div className="text-sm text-red-700">Stop Loss</div>
            <div className="font-semibold text-red-700 mt-1">
              ${signal.stopLoss.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-sm text-gray-500">Ризик/Прибуток</div>
            <div className="font-semibold mt-1">1:{signal.riskReward}</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Timer className="w-4 h-4" />
            <span>Таймфрейм: {signal.timeframe}</span>
          </div>
          {type === 'futures' && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Рекомендований депозит: ${signal.recommendedDeposit}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Створено: {new Date(signal.createdAt).toLocaleString()}</span>
          </div>
          {signal.description && (
            <div className="mt-4 text-gray-600">
              {signal.description}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {signal.status === 'ACTIVE' && (
            <button
              onClick={() => onJoin(signal.id)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Приєднатися до сигналу
            </button>
          )}
          <button
            onClick={() => copyToClipboard(JSON.stringify(signal, null, 2))}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Копіювати деталі
          </button>
        </div>

        {/* Risk Warning */}
        <div className="bg-yellow-50 p-4 rounded-xl">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            <div>
              <p className="text-sm text-yellow-700 font-medium">
                Ризик менеджмент:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-600">
                <li>• Не ризикуйте більше 1-2% від депозиту</li>
                <li>• Обов'язково встановлюйте стоп-лос</li>
                <li>• Не входьте в угоду після сильного руху</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SignalModal;