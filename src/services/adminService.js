// src/services/adminService.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

class AdminService {
    async createAdmin(adminData) {
        return await Admin.create(adminData);
    }

    async validateAdmin(username, password) {
        const admin = await Admin.findOne({ where: { username, isActive: true } });
        if (!admin) return null;

        const isValid = await admin.validatePassword(password);
        if (!isValid) return null;

        // Оновлюємо час останнього входу
        await admin.update({ lastLogin: new Date() });
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

    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await Admin.findOne({ 
                where: { 
                    id: decoded.id, 
                    isActive: true 
                } 
            });
            return admin ? decoded : null;
        } catch (error) {
            return null;
        }
    }

    async getAdminById(id) {
        return await Admin.findByPk(id);
    }

    async updateAdmin(id, updateData) {
        const admin = await Admin.findByPk(id);
        if (!admin) throw new Error('Адміністратора не знайдено');
        return await admin.update(updateData);
    }
    async createPasswordResetToken(email) {
        const admin = await Admin.findOne({ where: { email, isActive: true } });
        if (!admin) return null;

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        await admin.update({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: Date.now() + 3600000 // 1 година
        });

        return resetToken;
    }

    async resetPassword(token, newPassword) {
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const admin = await Admin.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [Op.gt]: Date.now() },
                isActive: true
            }
        });

        if (!admin) return false;

        await admin.update({
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        return true;
    }

    async sendPasswordResetEmail(email) {
        const resetToken = await this.createPasswordResetToken(email);
        if (!resetToken) return false;

        return await emailService.sendPasswordResetEmail(email, resetToken);
    }
    async resetPassword(token, newPassword) {
        // Валідація паролю
        const validation = PasswordUtils.validatePassword(newPassword);
        if (!validation.isValid) {
            throw new Error(validation.errors.join('. '));
        }

        const hashedToken = PasswordUtils.hashToken(token);

        const admin = await Admin.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [Op.gt]: Date.now() },
                isActive: true
            }
        });

        if (!admin) {
            throw new Error('Недійсний або застарілий токен відновлення паролю');
        }

        // Додаємо логування спроби зміни паролю
        console.log(`Password reset attempt for admin ID: ${admin.id}`);

        await admin.update({
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            lastPasswordReset: new Date()
        });

        return true;
    }

    async createPasswordResetToken(email) {
        const admin = await Admin.findOne({ 
            where: { 
                email, 
                isActive: true 
            } 
        });

        if (!admin) {
            // Не показуємо, що email не існує (захист від enumeration)
            return null;
        }

        // Перевірка на частоту запитів скидання паролю
        const lastReset = admin.resetPasswordExpires;
        if (lastReset && Date.now() - lastReset < 15 * 60 * 1000) { // 15 хвилин
            throw new Error('Зачекайте 15 хвилин перед повторним запитом');
        }

        const resetToken = PasswordUtils.generateResetToken();
        const hashedToken = PasswordUtils.hashToken(resetToken);

        await admin.update({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: Date.now() + 3600000 // 1 година
        });

        return resetToken;
    }

    async trackFailedResetAttempt(email) {
        // Можна додати логіку для відстеження невдалих спроб
        console.log(`Failed password reset attempt for email: ${email}`);
    }
}

module.exports = new AdminService();