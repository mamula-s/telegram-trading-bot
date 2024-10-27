import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import SignalModal from '../components/SignalModal';
import SignalFilters from '../components/SignalFilters';
import { fetchFuturesStats, fetchFuturesSignals, joinSignal } from '../services/signalsApi';

const FuturesPage = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrades: 0,
    successRate: 0,
    profitTotal: 0,
    avgProfit: 0,
    weeklyProfit: 0,
    monthlyProfit: 0
  });

  const [signals, setSignals] = useState([]);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    pair: '',
    direction: null,
    sort: 'newest',
    showFilters: false,
    page: 1,
    limit: 10
  });

  const [performanceData, setPerformanceData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadData(true);
  }, [filters.status, filters.pair, filters.direction, filters.sort]);

  const loadData = async (reset = false) => {
    try {
      setIsLoading(true);
      const page = reset ? 1 : filters.page;
      
      const [statsData, signalsData] = await Promise.all([
        fetchFuturesStats(),
        fetchFuturesSignals({ ...filters, page })
      ]);

      setStats(statsData);
      setSignals(prev => reset ? signalsData.signals : [...prev, ...signalsData.signals]);
      setPerformanceData(signalsData.performance || []);
      setHasMore(signalsData.hasMore);
      
      if (reset) {
        setFilters(prev => ({ ...prev, page: 1 }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification('error', 'Помилка завантаження даних. Спробуйте оновити сторінку');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    await loadData(false);
  };

  const handleJoinSignal = async (signalId) => {
    try {
      await joinSignal(signalId);
      addNotification('success', 'Ви успішно приєдналися до сигналу');
      await loadData(true);
      setSelectedSignal(null);
    } catch (error) {
      console.error('Error joining signal:', error);
      addNotification('error', 'Помилка при приєднанні до сигналу');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Всього угод</div>
          <div className="text-2xl font-bold">{stats.totalTrades}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Успішність</div>
          <div className="text-2xl font-bold text-green-500">{stats.successRate}%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Тижневий профіт</div>
          <div className={`text-2xl font-bold ${stats.weeklyProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.weeklyProfit > 0 ? '+' : ''}{stats.weeklyProfit}%
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Місячний профіт</div>
          <div className={`text-2xl font-bold ${stats.monthlyProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.monthlyProfit > 0 ? '+' : ''}{stats.monthlyProfit}%
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
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
      </div>

      {/* Filters */}
      <SignalFilters
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
      />

      {/* Risk Warning */}
      <div className="bg-yellow-50 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-700 shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium mb-1">Важливе попередження про ризики:</p>
          <p>Торгівля на криптовалютному ринку пов'язана з високим ризиком. 
             Рекомендуємо використовувати не більше 1-2% від депозиту на одну угоду 
             та обов'язково встановлювати стоп-лос.</p>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Активні сигнали</h2>
          <div className="text-sm text-gray-500">
            {signals.length} сигналів
          </div>
        </div>

        {isLoading && signals.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-2 text-gray-500">Завантаження...</div>
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Активних сигналів немає
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {signals.map(signal => (
                <div
                  key={signal.id}
                  onClick={() => setSelectedSignal(signal)}
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
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
                        Вхід: ${signal.entryPrice.toLocaleString()}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-gray-600">
                          TP: ${signal.takeProfit.toLocaleString()}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-600">
                          SL: ${signal.stopLoss.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        signal.profit >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {signal.profit >= 0 ? '+' : ''}{signal.profit}%
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(signal.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Завантаження...' : 'Завантажити ще'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Signal Modal */}
      {selectedSignal && (
        <SignalModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
          onJoin={handleJoinSignal}
        />
      )}
    </div>
  );
};

export default FuturesPage;