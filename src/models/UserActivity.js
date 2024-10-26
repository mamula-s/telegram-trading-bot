// src/models/UserActivity.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const UserActivity = sequelize.define('UserActivity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['action']
        },
        {
            fields: ['createdAt']
        }
    ]
});

module.exports = UserActivity;