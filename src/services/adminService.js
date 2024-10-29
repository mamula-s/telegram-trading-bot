// src/services/adminService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { Op } = require('sequelize');

class AdminService {
  async createAdmin(data) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    return await Admin.create({
      ...data,
      password: hashedPassword
    });
  }

  async validateCredentials(username, password) {
    const admin = await Admin.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return null;
    }

    // Оновлюємо час останнього входу
    await admin.update({
      lastLoginAt: new Date()
    });

    return admin;
  }

  generateToken(admin) {
    return jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  async resetPassword(token, newPassword) {
    const admin = await Admin.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Op.gt]: new Date() }
      }
    });

    if (!admin) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await admin.update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    return true;
  }

  async generateResetToken(email) {
    const admin = await Admin.findOne({ where: { email } });
    
    if (!admin) {
      return null;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    await admin.update({
      passwordResetToken: hashedToken,
      passwordResetExpires: Date.now() + 3600000 // 1 година
    });

    return token;
  }
}

module.exports = new AdminService();