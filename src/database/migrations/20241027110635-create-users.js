// XXXXXXXXXX-create-users.js (файл з часовою міткою)
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      telegramId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isSubscribed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      subscriptionType: {
        type: Sequelize.STRING,
        defaultValue: 'FREE'
      },
      subscriptionEndDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isBlocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('Users');
  }
};