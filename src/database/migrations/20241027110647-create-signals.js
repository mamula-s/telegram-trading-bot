// src/database/migrations/YYYYMMDDHHMMSS-create-signals.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Signals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('SPOT', 'FUTURES'),
        allowNull: false
      },
      pair: {
        type: Sequelize.STRING,
        allowNull: false
      },
      direction: {
        type: Sequelize.ENUM('LONG', 'SHORT'),
        allowNull: false
      },
      entryPrice: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false
      },
      takeProfit: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false
      },
      stopLoss: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false
      },
      riskLevel: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'CLOSED', 'CANCELLED'),
        defaultValue: 'ACTIVE'
      },
      exitPrice: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true
      },
      result: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      closeNote: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      closedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Signals');
  }
};