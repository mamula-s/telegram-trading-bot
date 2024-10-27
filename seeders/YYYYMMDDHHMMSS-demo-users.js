// src/database/seeders/YYYYMMDDHHMMSS-demo-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      telegramId: '869240620', // ваш DEVELOPER_ID
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isSubscribed: true,
      subscriptionType: 'FULL',
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 рік
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};