// src/database/seeders/create-admin.js
const adminService = require('../../services/adminService');

module.exports = {
  async up(queryInterface, Sequelize) {
    await adminService.createAdmin({
      username: 'admin',
      email: 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'super_admin'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Admins', null, {});
  }
};