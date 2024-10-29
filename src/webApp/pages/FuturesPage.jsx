// src/webApp/pages/FuturesPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, AlertCircle, ArrowUp, ArrowDown, Info
} from 'lucide-react';
import SignalModal from '../components/modals/SignalModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { useNotification } from '../contexts/NotificationContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorView from '../components/ErrorView';

const FuturesPage = () => {
  const { addNotification } = useNotification();
  const { fetchApi, isLoading } = useApi();
  const { connected } = useWebSocketContext();
  
  // WebSocket підключення
  useWebSocket('/futures');
  
  // Стани
  const [stats, setStats] = useState({
    totalTrades: 0,
    successRate: 0,
    profitTotal: 0,
    avgProfit: 0,
    activeSignals: 0,
    volume24h: 0
  });

  const [signals, setSignals] = useState([]);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [showConfirmJoin, setShowConfirmJoin] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState({
    prices: {},
    updates: {}
  });

  // WebSocket обробники
  useEffect(() => {
    const handleWebSocketMessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_signal':
          setSignals(prev => [data.signal, ...prev]);
          addNotification('info', 'Новий ф\'ючерсний сигнал');
          break;

        case 'signal_update':
          setSignals(prev => prev.map(signal => 
            signal.id === data.signal.id ? {
              ...signal,
              ...data.signal,
              realTimePrice: data.currentPrice,
              realTimeProfit: data.profit
            } : signal
          ));
          break;

        case 'signal_close':
          setSignals(prev => prev.filter(signal => signal.id !== data.signalId));
          addNotification('info', 'Сигнал закрито');
          break;

        case 'stats_update':
          setStats(prev => ({
            ...prev,
            ...data.stats
          }));
          break;

        case 'price_update':
          setRealTimeData(prev => ({
            ...prev,
            prices: {
              ...prev.prices,
              [data.pair]: data.price
            }
          }));
          break;

        default:
          break;
      }
    };

    window.addEventListener('ws_message', handleWebSocketMessage);
    return () => window.removeEventListener('ws_message', handleWebSocketMessage);
  }, [addNotification]);

  // Завантаження даних
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [statsData, signalsData] = await Promise.all([
        fetchApi('futures/stats'),
        fetchApi('futures/signals')
      ]);
      
      setStats(statsData);
      setSignals(signalsData.signals.map(signal => ({
        ...signal,
        realTimePrice: signal.currentPrice,
        realTimeProfit: signal.profit
      })));
      setPerformanceData(signalsData.performance);
    } catch (err) {
      setError('Помилка завантаження даних');
      addNotification('error', 'Не вдалося завантажити дані');
    }
  };

  // Обробники подій
  const handleSignalClick = (signal) => {
    setSelectedSignal({
      ...signal,
      currentPrice: realTimeData.prices[signal.pair] || signal.currentPrice
    });
  };

  const handleJoinSignal = async (signalId) => {
    try {
      const response = await fetchApi(`futures/signals/${signalId}/join`, { 
        method: 'POST' 
      });
      
      if (response.success) {
        addNotification('success', 'Ви успішно приєднались до сигналу');
        setSelectedSignal(null);
        await loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      addNotification('error', error.message || 'Помилка при приєднанні до сигналу');
    }
  };

  // Форматування даних
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  if (error) {
    return (
      <ErrorView 
        message={error} 
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-sm ${
        connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {connected ? 'Онлайн' : 'Офлайн'}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-gray-500 text-sm">Всього угод</div>
          <div className="text-2xl font-bold">{stats.totalTrades}</div>
        </Card>
        <Card>
          <div className="text-gray-500 text-sm">Успішність</div>
          <div className="text-2xl font-bold text-green-500">
            {stats.successRate}%
          </div>
        </Card>
        <Card>
          <div className="text-gray-500 text-sm">Загальний прибуток</div>
          <div className="text-2xl font-bold">${formatPrice(stats.profitTotal)}</div>
        </Card>
        <Card>
          <div className="text-gray-500 text-sm">Середній прибуток</div>
          <div className="text-2xl font-bold">{stats.avgProfit}%</div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Графік прибутковості</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>Останні 30 днів</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#f0f0f0' }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#f0f0f0' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                formatter={(value) => [`${value}%`, 'Прибуток']}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4, fill: '#2563eb' }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Risk Warning */}
      <Card className="bg-yellow-50 border border-yellow-100">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium">Важливе попередження про ризики:</p>
            <p>Торгівля на криптовалютному ринку пов'язана з високим ризиком. 
               Рекомендуємо використовувати не більше 1-2% від депозиту на одну угоду 
               та обов'язково встановлювати стоп-лос.</p>
          </div>
        </div>
      </Card>

      {/* Signals List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Активні сигнали</h2>
        {isLoading ? (
          <Loading text="Завантаження сигналів..." />
        ) : signals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Активних сигналів немає
          </div>
        ) : (
          signals.map((signal) => (
            <Card
              key={signal.id}
              onClick={() => handleSignalClick(signal)}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{signal.pair}</span>
                    <span className={`
                      flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
                      ${signal.direction === 'LONG'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }
                    `}>
                      {signal.direction === 'LONG'
                        ? <ArrowUp className="w-4 h-4" />
                        : <ArrowDown className="w-4 h-4" />
                      }
                      {signal.direction}
                    </span>
                    <span className="text-sm text-gray-500">• {signal.leverage}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Вхід: ${formatPrice(signal.entryPrice)}
                    {signal.realTimePrice && signal.realTimePrice !== signal.entryPrice && (
                      <span className="ml-2 text-gray-400">
                        Поточна: ${formatPrice(signal.realTimePrice)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="text-gray-600">
                      TP: ${formatPrice(signal.takeProfit)}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-600">
                      SL: ${formatPrice(signal.stopLoss)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {signal.realTimePrice && (
                    <div className={`text-lg font-bold ${
                      signal.realTimeProfit >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {signal.realTimeProfit > 0 ? '+' : ''}{signal.realTimeProfit}%
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(signal.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Модальні вікна */}
      <SignalModal
        isOpen={!!selectedSignal}
        onClose={() => setSelectedSignal(null)}
        signal={selectedSignal}
        onJoin={(signalId) => setShowConfirmJoin(true)}
        type="futures"
        realTimeData={realTimeData}
      />

      <ConfirmModal
        isOpen={showConfirmJoin}
        onClose={() => setShowConfirmJoin(false)}
        onConfirm={() => {
          handleJoinSignal(selectedSignal?.id);
          setShowConfirmJoin(false);
        }}
        title="Приєднатися до сигналу"
        message={`Ви впевнені, що хочете приєднатися до сигналу ${selectedSignal?.pair}? 
                 Переконайтеся, що розмір позиції не перевищує рекомендований.`}
        confirmText="Приєднатися"
        type="warning"
      />
    </div>
  );
};

export default FuturesPage;