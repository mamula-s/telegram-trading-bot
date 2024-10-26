// src/admin/routes/auth.js
const express = require('express');
const router = express.Router();
const adminService = require('../../services/adminService');

router.get('/login', (req, res) => {
    res.render('login', { layout: false });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await adminService.validateAdmin(username, password);
        
        if (!admin) {
            return res.render('login', {
                layout: false,
                error: 'Невірний логін або пароль'
            });
        }

        const token = adminService.generateToken(admin);
        
        // Встановлюємо cookie
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 години
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            layout: false,
            error: 'Помилка автентифікації'
        });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
});
// Додаємо rate limiting для захисту від брутфорсу
router.use('/forgot-password', rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 5 // максимум 5 запитів
}));

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Базова валідація email
        if (!email || !email.includes('@')) {
            return res.render('forgot-password', {
                layout: false,
                error: 'Будь ласка, введіть коректний email'
            });
        }

        const sent = await adminService.sendPasswordResetEmail(email);
        
        // Завжди показуємо успішне повідомлення (захист від enumeration)
        res.render('forgot-password', {
            layout: false,
            success: 'Якщо вказаний email існує, на нього буде надіслано інструкції з відновлення паролю'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Виникла помилка при обробці запиту';
        if (error.message.includes('Зачекайте')) {
            errorMessage = error.message;
        }

        res.render('forgot-password', {
            layout: false,
            error: errorMessage
        });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const { token } = req.params;

        // Валідація паролів
        if (password !== confirmPassword) {
            return res.render('reset-password', {
                layout: false,
                token,
                error: 'Паролі не співпадають'
            });
        }

        await adminService.resetPassword(token, password);

        // Додаємо flash повідомлення про успіх
        req.flash('success', 'Пароль успішно змінено. Тепер ви можете увійти.');
        res.redirect('/admin/login');

    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Виникла помилка при зміні паролю';
        if (error.message.includes('Пароль повинен')) {
            errorMessage = error.message;
        }

        res.render('reset-password', {
            layout: false,
            token: req.params.token,
            error: errorMessage
        });
    }
});

module.exports = router;