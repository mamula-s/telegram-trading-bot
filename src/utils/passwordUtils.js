// src/utils/passwordUtils.js
class PasswordUtils {
    static validatePassword(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Пароль повинен містити мінімум 8 символів');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Пароль повинен містити хоча б одну велику літеру');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Пароль повинен містити хоча б одну малу літеру');
        }
        
        if (!/[0-9]/.test(password)) {
            errors.push('Пароль повинен містити хоча б одну цифру');
        }
        
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Пароль повинен містити хоча б один спеціальний символ (!@#$%^&*)');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    static hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}

module.exports = PasswordUtils;