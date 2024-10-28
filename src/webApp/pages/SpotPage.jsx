import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, ArrowUp, ArrowDown, Info, Wallet } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import SignalModal from '../components/SignalModal';
import SignalFilters from '../components/SignalFilters';

const SpotPage = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrades: 0,
    successRate: 0,
    totalVolume: 0,
    avgHoldingTime: '0',
    unrealizedProfit: 0,
    realizedProfit: 0
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
    limit: 10,
    minVolume: '',
    maxVolume: '',
    holdingPeriod: 'all' // all, short, medium, long
  });

  const [performanceData, setPerformanceData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    loadData(true);
  }, [filters.status, filters.pair, filters.direction, filters.sort, filters.holdingPeriod]);

  const loadData = async (reset = false) => {
    try {
      setIsLoading(true);
      const page = reset ? 1 : filters.page;

      const [statsData, signalsData, holdingsData] = await Promise.all([
        fetch('/api/spot/stats').then(res => res.json()),
        fetch(`/api/spot/signals?${new URLSearchParams({
          ...filters,
          page
        })}`).then(res => res.json()),
        fetch('/api/spot/holdings').then(res => res.json())
      ]);

      setStats(statsData);
      setSignals(prev => reset ? signalsData.signals : [...prev, ...signalsData.signals]);
      setPerformanceData(signalsData.performance || []);
      setHoldings(holdingsData);
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
      await fetch(`/api/spot/signals/${signalId}/join`, {
        method: 'POST'
      });
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
      {/* Portfolio Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5" />
          <span className="text-lg font-bold">Ваш спот портфель</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-75">Загальний баланс</div>
            <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm opacity-75">Нереалізований прибуток</div>
            <div className={`text-2xl font-bold ${
              stats.unrealizedProfit >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {stats.unrealizedProfit > 0 ? '+' : ''}{stats.unrealizedProfit}%
            </div>
          </div>
        </div>
      </div>

      {/* Trading Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Всього угод</div>
          <div className="text-2xl font-bold">{stats.totalTrades}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Успішність</div>
          <div className="text-2xl font-bold text-green-500">{stats.successRate}%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Середній час утримання</div>
          <div className="text-2xl font-bold">{stats.avgHoldingTime}</div>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Поточні позиції</h2>
        <div className="space-y-3">
          {holdings.map(holding => (
            <div key={holding.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium">{holding.pair}</div>
                <div className="text-sm text-gray-500">
                  Кількість: {holding.amount} • Середня ціна: ${holding.avgPrice}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${
                  holding.profit >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {holding.profit > 0 ? '+' : ''}{holding.profit}%
                </div>
                <div className="text-sm text-gray-500">
                  ${holding.currentValue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {holdings.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Немає відкритих позицій
            </div>
          )}
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
        onChange={setFilters}
        additionalFilters={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Період утримання
              </label>
              <select
                value={filters.holdingPeriod}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  holdingPeriod: e.target.value
                }))}
                className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Всі періоди</option>
                <option value="short">Короткострокові (до 1 дня)</option>
                <option value="medium">Середньострокові (1-7 днів)</option>
                <option value="long">Довгострокові (більше 7 днів)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Мінімальний об'єм
              </label>
              <input
                type="number"
                value={filters.minVolume}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minVolume: e.target.value
                }))}
                placeholder="Мін. об'єм в USDT"
                className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        }
      />

      {/* Risk Warning */}
      <div className="bg-yellow-50 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-700 shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium mb-1">Важливе попередження про ризики:</p>
          <p>Торгівля на спотовому ринку криптовалют пов'язана з ризиками.
             Рекомендуємо диверсифікувати портфель та не інвестувати більше,
             ніж ви готові втратити.</p>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Спотові сигнали</h2>
          <div className="text-sm text-gray-500">
            {signals.length} сигналів
          </div>
        </div>

        {/* Signals Grid/List */}
        {isLoading && signals.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-2 text-gray-500">Завантаження...</div>
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Сигналів не знайдено
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {signals.map(signal => (
                <div
                  key={signal.id}
                  onClick={() => setSelectedSignal(signal)}
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{signal.pair}</span>
                        <span className={`
                          flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
                          ${signal.direction === 'BUY'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }
                        `}>
                          {signal.direction === 'BUY'
                            ? <ArrowUp className="w-4 h-4" />
                            : <ArrowDown className="w-4 h-4" />
                          }
                          {signal.direction}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Ціна: ${signal.price.toLocaleString()}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Рекомендований об'єм: ${signal.recommendedVolume.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {signal.status === 'ACTIVE' && signal.currentPrice && (
                        <div className={`text-lg font-bold ${
                          signal.profit >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {signal.profit > 0 ? '+' : ''}{signal.profit}%
                        </div>
                      )}
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
          type="spot"
        />
      )}
    </div>
  );
};

export default SpotPage;