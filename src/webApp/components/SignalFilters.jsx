import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const SignalFilters = ({ filters, onChange }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
      {/* Search and Filter Header */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Пошук за парою..."
            value={filters.pair}
            onChange={(e) => onChange({ ...filters, pair: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          className="ml-4 p-2 hover:bg-gray-100 rounded-xl"
          onClick={() => onChange({ ...filters, showFilters: !filters.showFilters })}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Extended Filters */}
      {filters.showFilters && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
              className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі сигнали</option>
              <option value="active">Активні</option>
              <option value="closed">Закриті</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Напрямок
            </label>
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 px-4 rounded-xl ${
                  filters.direction === 'LONG'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => onChange({ 
                  ...filters, 
                  direction: filters.direction === 'LONG' ? null : 'LONG'
                })}
              >
                LONG
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-xl ${
                  filters.direction === 'SHORT'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => onChange({
                  ...filters,
                  direction: filters.direction === 'SHORT' ? null : 'SHORT'
                })}
              >
                SHORT
              </button>
            </div>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сортування
            </label>
            <select
              value={filters.sort}
              onChange={(e) => onChange({ ...filters, sort: e.target.value })}
              className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Спочатку нові</option>
              <option value="profit">За прибутком</option>
              <option value="participants">За кількістю учасників</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalFilters;