const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const Signal = sequelize.define('Signal', {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pair: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direction: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entryPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  takeProfit: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stopLoss: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  note: DataTypes.TEXT
});

module.exports = Signal;