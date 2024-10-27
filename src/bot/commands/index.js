// src/bot/commands/index.js

module.exports = (bot, userService, signalService, subscriptions) => {
  // Команда /start
  bot.onText(/\/start/, async (msg) => {
      try {
          const chatId = msg.chat.id;
          console.log(`Отримано команду /start від користувача ${msg.from.id}`);
          
          const user = await userService.createUser({
              telegramId: msg.from.id.toString(),
              username: msg.from.username,
              firstName: msg.from.first_name,
              lastName: msg.from.last_name,
          });
          console.log(`Створено або оновлено користувача:`, user);

          const updatedUser = await userService.updateUserSubscription(user.telegramId);
          console.log(`Оновлено підписку користувача:`, updatedUser);

          let welcomeMessage = `Вітаємо, ${updatedUser.firstName}!`;
          if (updatedUser.isSubscribed && updatedUser.subscriptionType === 'FULL') {
              welcomeMessage += ' У вас активована FULL підписка.';
          } else {
              welcomeMessage += ' Для отримання доступу до функцій бота, будь ласка, оформіть підписку. Використовуйте /subscribe для перегляду доступних опцій.';
          }

          bot.sendMessage(chatId, welcomeMessage);
      } catch (error) {
          console.error('Помилка обробки команди /start:', error);
          bot.sendMessage(chatId, 'Виникла помилка при обробці команди. Спробуйте ще раз пізніше.');
      }
  });

  // Команда /help
  bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 
          'Доступні команди:\n' +
          '/start - Почати\n' +
          '/help - Допомога\n' +
          '/subscribe - Оформити підписку\n' +
          '/status - Перевірити статус підписки\n' +
          '/signals - Отримати сигнали\n' +
          '/portfolio - Переглянути портфоліо\n' +
          '/settings - Налаштування\n' +
          '/webapp - Відкрити веб-додаток'
      );
  });

  // Команда /subscribe
  bot.onText(/\/subscribe/, async (msg) => {
      try {
          const chatId = msg.chat.id;
          const keyboard = {
              inline_keyboard: Object.values(subscriptions).map(sub => (
                  [{ text: `${sub.name} - $${sub.price}`, callback_data: `subscribe_${sub.id}` }]
              ))
          };
          await bot.sendMessage(chatId, 'Виберіть тип підписки:', { reply_markup: JSON.stringify(keyboard) });
      } catch (error) {
          console.error('Помилка при обробці команди /subscribe:', error);
      }
  });

  // Команда /status
  bot.onText(/\/status/, async (msg) => {
      try {
          const chatId = msg.chat.id;
          const user = await userService.getUserByTelegramId(msg.from.id.toString());

          if (user && user.isSubscribed) {
              const endDate = new Date(user.subscriptionEndDate).toLocaleDateString();
              bot.sendMessage(chatId, `Ваша ${user.subscriptionType.toUpperCase()} підписка активна до ${endDate}.`);
          } else {
              bot.sendMessage(chatId, 'У вас немає активної підписки. Використовуйте /subscribe для оформлення.');
          }
      } catch (error) {
          console.error('Помилка обробки команди /status:', error);
      }
  });

  // Команда /signals
  bot.onText(/\/signals/, async (msg) => {
      try {
          const chatId = msg.chat.id;
          const user = await userService.getUserByTelegramId(msg.from.id.toString());
          
          if (user && user.isSubscribed) {
              const signals = await signalService.getRecentSignals(user.subscriptionType);
              let message = 'Останні сигнали:\n\n';
              signals.forEach(signal => {
                  message += `${signal.type.toUpperCase()} | ${signal.pair} | ${signal.direction}\n`;
                  message += `Вхід: ${signal.entryPrice} | TP: ${signal.takeProfit} | SL: ${signal.stopLoss}\n\n`;
              });
              bot.sendMessage(chatId, message);
          } else {
              bot.sendMessage(chatId, 'Для отримання сигналів потрібна активна підписка. Використовуйте /subscribe для оформлення.');
          }
      } catch (error) {
          console.error('Помилка обробки команди /signals:', error);
      }
  });

  // Команда /portfolio
  bot.onText(/\/portfolio/, async (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 'Функція управління портфелем знаходиться в розробці.');
  });

  // Команда /settings
  bot.onText(/\/settings/, async (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 'Налаштування користувача:\n1. Частота сигналів: Всі\n2. Сповіщення: Увімкнено');
  });

  // Команда /webapp
  bot.onText(/\/webapp/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 'Натисніть кнопку нижче, щоб відкрити Web App:', {
          reply_markup: {
              keyboard: [[{ text: 'Відкрити Trading Dashboard', web_app: { url: `${process.env.BASE_URL}/webapp` } }]],
              resize_keyboard: true,
              one_time_keyboard: false
          }
      });
  });

  // Обробка callback-запитів
  bot.on('callback_query', async (callbackQuery) => {
      try {
          const action = callbackQuery.data;
          const msg = callbackQuery.message;
          const chatId = msg.chat.id;

          if (action.startsWith('subscribe_')) {
              const subscriptionId = action.split('_')[1];
              const user = await userService.getUserByTelegramId(chatId.toString());
              
              if (user.subscriptionType === 'FULL') {
                  bot.answerCallbackQuery(callbackQuery.id, { text: 'У вас вже є активна FULL підписка!' });
                  bot.sendMessage(chatId, `Ви маєте FULL підписку до ${user.subscriptionEndDate.toLocaleDateString()}`);
              } else {
                  bot.answerCallbackQuery(callbackQuery.id, { text: 'Для оформлення підписки необхідна оплата.' });
                  bot.sendMessage(chatId, "Для оформлення підписки, будь ласка, зв'яжіться з адміністратором або дочекайтеся реалізації системи оплати.");
              }
          }
      } catch (error) {
          console.error('Помилка обробки callback query:', error);
          bot.answerCallbackQuery(callbackQuery.id, { text: 'Виникла помилка. Спробуйте пізніше.' });
      }
  });

  // Обробка помилок
  bot.on('polling_error', (error) => {
      console.error('Помилка поллінгу бота:', error);
  });

  bot.on('webhook_error', (error) => {
      console.error('Помилка вебхука бота:', error);
  });
};