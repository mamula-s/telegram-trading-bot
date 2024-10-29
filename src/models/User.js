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
        defaultValue: 'FREE'
    },
    isSubscribed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    subscriptions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        get() {
            const rawValue = this.getDataValue('subscriptions');
            return rawValue || [];
        }
    },
    subscriptionEndDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Додаємо асоціації
User.associate = (models) => {
    User.hasMany(models.UserActivity, {
        foreignKey: 'userId',
        as: 'activities'
    });
};

module.exports = User;