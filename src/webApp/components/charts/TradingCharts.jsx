import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const TradingCharts = ({ data = [], type = 'performance', title = 'Trading Statistics' }) => {
  const formatNumber = (number) => {
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const formatPercent = (decimal) => {
    return `${formatNumber(decimal * 100)}%`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background border rounded p-2 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {
              entry.unit === '%' 
                ? formatPercent(entry.value) 
                : formatNumber(entry.value)
            }
          </p>
        ))}
      </div>
    );
  };

  const renderPerformanceChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis 
          dataKey="date" 
          stroke="#666"
          tick={{ fill: '#666' }}
        />
        <YAxis 
          stroke="#666"
          tick={{ fill: '#666' }}
          tickFormatter={formatPercent}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#10b981"
          dot={false}
          unit="%"
          name="Прибуток"
        />
        <Line
          type="monotone"
          dataKey="drawdown"
          stroke="#ef4444"
          dot={false}
          unit="%"
          name="Просадка"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderVolumeChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis 
          dataKey="date" 
          stroke="#666"
          tick={{ fill: '#666' }}
        />
        <YAxis 
          stroke="#666"
          tick={{ fill: '#666' }}
          tickFormatter={formatNumber}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="volume"
          fill="#3b82f6"
          name="Об'єм торгів"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderWinRateChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis 
          dataKey="date" 
          stroke="#666"
          tick={{ fill: '#666' }}
        />
        <YAxis 
          stroke="#666"
          tick={{ fill: '#666' }}
          tickFormatter={formatPercent}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="winRate"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.3}
          unit="%"
          name="Вінрейт"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={type} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Прибуток</TabsTrigger>
            <TabsTrigger value="volume">Об'єм</TabsTrigger>
            <TabsTrigger value="winRate">Вінрейт</TabsTrigger>
          </TabsList>
          <TabsContent value="performance">
            {renderPerformanceChart()}
          </TabsContent>
          <TabsContent value="volume">
            {renderVolumeChart()}
          </TabsContent>
          <TabsContent value="winRate">
            {renderWinRateChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradingCharts;