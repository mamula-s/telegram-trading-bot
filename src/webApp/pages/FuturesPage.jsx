import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { fetchFuturesStats, fetchFuturesSignals, joinSignal } from '../services/signalsApi';
import SignalModal from '../components/SignalModal';
import SignalFilters from '../components/SignalFilters';

const FuturesPage = () => {
  const [stats, setStats] = useState({
    totalTrades: 0,
    successRate: 0,
    profitTotal: 0,
    avgProfit: 0
  });

  const [signals, setSignals] = useState([]);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    pair: '',
    direction: null,
    sort: 'newest',
    showFilters: false
  });
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, signalsData] = await Promise.all([
        fetchFuturesStats(),
        fetchFuturesSignals(filters)
      ]);
      setStats(statsData);
      setSignals(signalsData.signals);
      setPerformanceData(signalsData.performance || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // TODO: Implement error notification
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSignal = async (signalId) => {
    try {
      await joinSignal(signalId);
      await loadData();
      setSelectedSignal(null);
      // TODO: Implement success notification
    } catch (error) {
      console.error('Error joining signal:', error);
      // TODO: Implement error notification
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Всього угод</div>
          <div className="text-2xl font-bold">{stats.totalTrades}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Успішність</div>
          <div className="text-2xl font-bold text-green-500">{stats.successRate}%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Загальний прибуток</div>
          <div className="text-2xl font-bold">${stats.profitTotal.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-gray-500 text-sm">Середній прибуток</div>
          <div className="text-2xl font-bold">{stats.avgProfit}%</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Графік прибутковості</h2>
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
      />

      {/* Signals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-2 text-gray-500">Завантаження...</div>
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Сигналів не знайдено
          </div>
        ) : (
          signals.map(signal => (
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
          ))
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