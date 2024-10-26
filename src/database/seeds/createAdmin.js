// src/database/seeds/createAdmin.js
const adminService = require('../../services/adminService');

async function createInitialAdmin() {
    try {
        await adminService.createAdmin({
            username: 'admin',
            email: 'admin@example.com',
            password: 'your-secure-password',
            role: 'super_admin'
        });
        console.log('Initial admin created successfully');
    } catch (error) {
        console.error('Error creating initial admin:', error);
    }
}

module.exports = createInitialAdmin;