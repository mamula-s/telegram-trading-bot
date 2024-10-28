import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const StatisticsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Загальний прибуток"
        value={stats.totalProfit}
        type="profit"
      />
      <StatCard
        title="Вінрейт"
        value={stats.winRate}
        type="percentage"
      />
      <StatCard
        title="Активні сигнали"
        value={stats.activeSignals}
        type="number"
      />
      <StatCard
        title="Успішні угоди"
        value={stats.successfulTrades}
        type="number"
      />
    </div>
  );
};

const StatCard = ({ title, value, type }) => {
  const formatValue = () => {
    switch (type) {
      case 'profit':
        return `${value >= 0 ? '+' : ''}${value}%`;
      case 'percentage':
        return `${value}%`;
      case 'number':
      default:
        return value;
    }
  };

  const getValueColor = () => {
    if (type === 'profit') {
      return value >= 0 ? 'text-green-500' : 'text-red-500';
    }
    return 'text-primary';
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className={`text-2xl font-bold ${getValueColor()}`}>
          {formatValue()}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsGrid;