// src/admin/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { fetchStats } from '../services/adminApi';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    activeSignals: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-bold">{stats.totalUsers}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="mt-2 text-3xl font-bold">{stats.activeUsers}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="mt-2 text-3xl font-bold">${stats.totalRevenue}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Signals</h3>
            <p className="mt-2 text-3xl font-bold">{stats.activeSignals}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;