// src/database/seeders/YYYYMMDDHHMMSS-demo-signals.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Signals', [{
      type: 'SPOT',
      pair: 'BTC/USDT',
      direction: 'LONG',
      entryPrice: '35000',
      takeProfit: '37000',
      stopLoss: '34000',
      riskLevel: 'MEDIUM',
      description: 'Test spot signal',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Signals', null, {});
  }
};