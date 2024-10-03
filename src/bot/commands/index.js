const userService = require('../../services/userService');
const paymentService = require('../../services/paymentService');

const commands = {
  '/start': async (bot, msg, user) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `Ласкаво просимо, ${user.firstName}! Використовуйте /help для отримання списку доступних команд.`);
  },

  '/help': async (bot, msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Доступні команди:\n/start - Почати\n/help - Допомога\n/subscribe - Підписатися\n/unsubscribe - Відмінити підписку\n/signals - Отримати сигнали\n/materials - Навчальні матеріали');
  },

  '/subscribe': async (bot, msg, user) => {
    const chatId = msg.chat.id;
    if (user.isSubscribed) {
      await bot.sendMessage(chatId, 'Ви вже підписані на преміум доступ.');
    } else {
      const keyboard = {
        inline_keyboard: [
          [{ text: 'Преміум (30 днів)', callback_data: 'subscribe_premium' }],
          [{ text: 'VIP (30 днів)', callback_data: 'subscribe_vip' }]
        ]
      };
      await bot.sendMessage(chatId, 'Виберіть тип підписки:', { reply_markup: JSON.stringify(keyboard) });
    }
  },

  '/unsubscribe': async (bot, msg, user) => {
    const chatId = msg.chat.id;
    if (!user.isSubscribed) {
      await bot.sendMessage(chatId, 'У вас немає активної підписки.');
    } else {
      await userService.updateUser(user.telegramId, { isSubscribed: false, subscriptionType: 'free' });
      await bot.sendMessage(chatId, 'Ви успішно відмінили вашу підписку. Сподіваємося побачити вас знову!');
    }
  },

  '/signals': async (bot, msg, user) => {
    const chatId = msg.chat.id;
    if (user.isSubscribed) {
      await bot.sendMessage(chatId, 'Ось останні сигнали: [Тут будуть відображатися останні сигнали]');
    } else {
      await bot.sendMessage(chatId, 'Для отримання сигналів потрібна преміум підписка. Використовуйте /subscribe для підписки.');
    }
  },

  '/materials': async (bot, msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Ось список доступних матеріалів: [Тут буде список матеріалів]');
  },
};

const handleCallbackQuery = async (bot, callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
  
    if (data.startsWith('subscribe_')) {
      const subscriptionType = data.split('_')[1];
      const prices = {
        'premium': 2500, // 2500 UAH
        'vip': 5000 // 5000 UAH
      };
  
      try {
        await paymentService.createInvoice(
          bot,
          chatId,
          `${subscriptionType.toUpperCase()} підписка`,
          `Доступ до всіх ${subscriptionType} функцій на 1 місяць`,
          prices[subscriptionType],
          subscriptionType // це буде використано як payload
        );
        await bot.answerCallbackQuery(callbackQuery.id);
      } catch (error) {
        console.error('Помилка створення рахунку:', error);
        await bot.sendMessage(chatId, 'Виникла помилка при створенні рахунку. Спробуйте пізніше.');
        await bot.answerCallbackQuery(callbackQuery.id, {text: 'Помилка створення рахунку'});
      }
    }
  };

module.exports = {
  commands,
  handleCallbackQuery
};