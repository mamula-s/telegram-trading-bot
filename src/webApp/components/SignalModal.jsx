import React from 'react';
import { X, ArrowUp, ArrowDown, Clock, DollarSign, Target, AlertTriangle } from 'lucide-react';

const SignalModal = ({ signal, onClose, onJoin }) => {
  if (!signal) return null;

  const isProfit = (signal.currentPrice - signal.entryPrice) * 
    (signal.direction === 'LONG' ? 1 : -1) > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg relative">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Деталі сигналу</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold">{signal.pair}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`
                  px-2 py-0.5 rounded-full text-sm font-medium
                  ${signal.direction === 'LONG' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                `}>
                  {signal.direction === 'LONG' ? <ArrowUp className="w-4 h-4 inline" /> : <ArrowDown className="w-4 h-4 inline" />}
                  {signal.direction}
                </span>
                <span className="text-sm text-gray-500">• {signal.leverage}</span>
              </div>
            </div>
            {signal.status === 'ACTIVE' && (
              <div className={`text-xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                {isProfit ? '+' : ''}{((signal.currentPrice - signal.entryPrice) / signal.entryPrice * 100).toFixed(2)}%
              </div>
            )}
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-sm text-gray-500">Ціна входу</div>
              <div className="text-lg font-medium">${signal.entryPrice}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="text-sm text-gray-500">Поточна ціна</div>
              <div className="text-lg font-medium">${signal.currentPrice}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <div className="text-sm text-green-700">Take Profit</div>
              <div className="text-lg font-medium">${signal.takeProfit}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-xl">
              <div className="text-sm text-red-700">Stop Loss</div>
              <div className="text-lg font-medium">${signal.stopLoss}</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Створено: {new Date(signal.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Рекомендований депозит: від ${signal.recommendedDeposit}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="w-4 h-4" />
              <span>Очікуваний прибуток: {signal.expectedProfit}%</span>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-yellow-50 p-3 rounded-xl flex gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              Рекомендований ризик на угоду: не більше 1-2% від депозиту.
              Завжди використовуйте стоп-лос для управління ризиками.
            </div>
          </div>

          {/* Action Buttons */}
          {signal.status === 'ACTIVE' && (
            <div className="flex gap-3">
              <button
                onClick={() => onJoin(signal.id)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Приєднатися до сигналу
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalModal;