// src/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${process.env.BASE_URL}/admin/reset-password/${resetToken}`;
        
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Відновлення паролю адміністратора',
            html: `
                <h1>Відновлення паролю</h1>
                <p>Ви отримали цей лист, тому що запросили відновлення паролю для адмін-панелі.</p>
                <p>Будь ласка, перейдіть за посиланням нижче для встановлення нового паролю:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 4px;">
                    Відновити пароль
                </a>
                <p>Якщо ви не запитували відновлення паролю, проігноруйте цей лист.</p>
                <p>Посилання дійсне протягом 1 години.</p>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}

module.exports = new EmailService();