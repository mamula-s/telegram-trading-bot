// src/services/adminService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { Op } = require('sequelize');

class AdminService {
  async validateCredentials(username, password) {
    try {
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
    } catch (error) {
      console.error('Error validating credentials:', error);
      throw error;
    }
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

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findByPk(decoded.id);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      return admin;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  async createAdmin(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 12);
      const admin = await Admin.create({
        ...data,
        password: hashedPassword
      });
      console.log(`Created admin: ${admin.username}`);
      return admin;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
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
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async generateResetToken(email) {
    try {
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
        passwordResetExpires: new Date(Date.now() + 3600000) // 1 година
      });

      return token;
    } catch (error) {
      console.error('Error generating reset token:', error);
      throw error;
    }
  }

  async getAdminStats() {
    try {
      const totalAdmins = await Admin.count();
      const activeAdmins = await Admin.count({
        where: {
          lastLoginAt: {
            [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Останні 24 години
          }
        }
      });

      return {
        total: totalAdmins,
        active: activeAdmins
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }
}

module.exports = new AdminService();