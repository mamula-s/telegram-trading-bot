const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const User = sequelize.define('User', {
  telegramId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  username: DataTypes.STRING,
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  isSubscribed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  subscriptionType: {
    type: DataTypes.STRING,
    defaultValue: 'free'
  },
  subscriptionEndDate: DataTypes.DATE
});

module.exports = User;