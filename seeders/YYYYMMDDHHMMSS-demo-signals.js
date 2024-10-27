// src/database/seeders/YYYYMMDDHHMMSS-demo-signals.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Signals', [
      {
        type: 'SPOT',
        pair: 'BTC/USDT',
        direction: 'LONG',
        entryPrice: '35000',
        takeProfit: '37000',
        stopLoss: '34000',
        timeframe: '4h',
        riskLevel: 'MEDIUM',
        description: 'Test spot signal',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'FUTURES',
        pair: 'ETH/USDT',
        direction: 'SHORT',
        entryPrice: '2000',
        takeProfit: '1900',
        stopLoss: '2050',
        timeframe: '1h',
        riskLevel: 'HIGH',
        description: 'Test futures signal',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Signals', null, {});
  }
};