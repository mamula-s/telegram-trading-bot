// src/models/Signal.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const Signal = sequelize.define('Signal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('SPOT', 'FUTURES'),
        allowNull: false
    },
    pair: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direction: {
        type: DataTypes.ENUM('LONG', 'SHORT'),
        allowNull: false
    },
    entryPrice: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
    },
    takeProfit: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
    },
    stopLoss: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
    },
    timeframe: {
        type: DataTypes.STRING,
        allowNull: false
    },
    riskLevel: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'CLOSED', 'CANCELLED'),
        defaultValue: 'ACTIVE'
    },
    exitPrice: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true
    },
    result: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    closeNote: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    indexes: [
        {
            fields: ['type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['pair']
        },
        {
            fields: ['createdAt']
        }
    ]
});

module.exports = Signal;