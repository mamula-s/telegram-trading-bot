// src/admin/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, CreditCard, Bell, TrendingUp } from 'lucide-react';
import AdminAPI from '../services/api';
import { StatsCard } from '../components';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, trend: 0 },
    revenue: { total: 0, trend: 0 },
    signals: { total: 0, trend: 0 },
    subscriptions: { total: 0, trend: 0 }
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [stats, activity, analytics] = await Promise.all([
        AdminAPI.getDashboardStats(),
        AdminAPI.getRecentActivity(),
        AdminAPI.getAnalytics()
      ]);

      setStats(stats);
      setRecentActivity(activity);
      setChartData(analytics.chartData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.users.total}
          icon={Users}
          trend={stats.users.trend}
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.revenue.total}`}
          icon={CreditCard}
          trend={stats.revenue.trend}
        />
        <StatsCard
          title="Active Signals"
          value={stats.signals.total}
          icon={Bell}
          trend={stats.signals.trend}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.subscriptions.total}
          icon={TrendingUp}
          trend={stats.subscriptions.trend}
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Revenue Overview</h2>
        <div className="h-80">
          <LineChart
            width={800}
            height={300}
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="px-6 py-4">
              <div className="flex items-center">
                <activity.icon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <span className="ml-auto text-sm text-gray-500">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;