const crypto = require('crypto');

const validateWebAppData = (req, res, next) => {
  try {
    // Отримуємо initData з хедера
    const initData = req.headers['x-telegram-init-data'];
    if (!initData) {
      return res.status(401).json({ error: 'No init data provided' });
    }

    // Розбираємо дані
    const parsedData = new URLSearchParams(initData);
    const hash = parsedData.get('hash');
    parsedData.delete('hash');

    // Сортуємо параметри
    const dataCheckString = Array.from(parsedData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Створюємо HMAC
    const secret = crypto.createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();

    const calculatedHash = crypto.createHmac('sha256', secret)
      .update(dataCheckString)
      .digest('hex');

    // Перевіряємо хеш
    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Invalid hash' });
    }

    // Додаємо дані користувача до запиту
    req.user = JSON.parse(parsedData.get('user'));
    next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { validateWebAppData };