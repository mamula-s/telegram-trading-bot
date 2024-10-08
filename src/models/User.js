const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const User = sequelize.define('User', {
  telegramId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  subscriptionType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  username: DataTypes.STRING,
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  subscriptions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('subscriptions');
      return rawValue ? rawValue : [];
    }
  },
  subscriptionEndDate: DataTypes.DATE
});

module.exports = User;