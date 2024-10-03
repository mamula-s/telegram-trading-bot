const PAYMENT_TOKEN = process.env.PAYMENT_TOKEN;
const userService = require('./userService');

const createInvoice = async (bot, chatId, productName, description, amount, payload) => {
  try {
    const prices = [{
      label: productName,
      amount: Math.round(amount * 100) // Конвертуємо в копійки та округляємо
    }];

    const result = await bot.sendInvoice(
      chatId, 
      productName, 
      description, 
      payload, 
      PAYMENT_TOKEN, 
      'UAH', // Код валюти для платежу
      prices, // Передаємо масив об'єктів напряму, без JSON.stringify
      {
        // Додаткові опції, якщо потрібно
        // is_flexible: false,
        // need_name: false,
        // need_phone_number: false,
        // need_email: false,
        // need_shipping_address: false,
        // send_phone_number_to_provider: false,
        // send_email_to_provider: false,
      }
    );
    return result;
  } catch (error) {
    console.error('Помилка створення рахунку:', error);
    throw error;
  }
};

const handleSuccessfulPayment = async (msg) => {
  const chatId = msg.chat.id;
  const { total_amount, invoice_payload } = msg.successful_payment;
  
  try {
    const user = await userService.getUserByTelegramId(chatId.toString());
    if (user) {
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // Додаємо 30 днів

      await userService.updateUser(user.telegramId, { 
        isSubscribed: true, 
        subscriptionType: invoice_payload,
        subscriptionEndDate: subscriptionEndDate
      });
      console.log(`Оновлено підписку для користувача ${chatId}`);
    } else {
      console.error(`Користувача з chatId ${chatId} не знайдено`);
    }
  } catch (error) {
    console.error('Помилка оновлення підписки:', error);
  }
  
  console.log(`Отримано платіж: ${total_amount / 100} UAH для ${invoice_payload}`);
};

const checkSubscription = async (userId) => {
  try {
    const user = await userService.getUserByTelegramId(userId);
    if (!user) {
      return false;
    }
    
    if (!user.isSubscribed) {
      return false;
    }
    
    const now = new Date();
    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      // Підписка закінчилася, оновлюємо статус користувача
      await userService.updateUser(userId, { isSubscribed: false, subscriptionType: 'free' });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Помилка перевірки підписки:', error);
    return false;
  }
};

const getSubscriptionInfo = async (userId) => {
  try {
    const user = await userService.getUserByTelegramId(userId);
    if (!user || !user.isSubscribed) {
      return 'У вас немає активної підписки.';
    }
    
    const endDate = new Date(user.subscriptionEndDate);
    const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    
    return `Ваша підписка: ${user.subscriptionType}\nЗакінчується: ${endDate.toLocaleDateString()}\nЗалишилось днів: ${daysLeft}`;
  } catch (error) {
    console.error('Помилка отримання інформації про підписку:', error);
    return 'Не вдалося отримати інформацію про підписку.';
  }
};

module.exports = {
  createInvoice,
  handleSuccessfulPayment,
  checkSubscription,
  getSubscriptionInfo
};