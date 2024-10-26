
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Доступні команди:\n/start - Почати\n/help - Допомога\n/subscribe - Оформити підписку\n/status - Перевірити статус підписки\n/signals - Отримати сигнали\n/portfolio - Переглянути портфоліо\n/settings - Налаштування\n/webapp - Відкрити веб-додаток');
});

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

bot.onText(/\/checkstatus/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const user = await userService.getUserByTelegramId(msg.from.id.toString());
    
    if (user && user.isSubscribed) {
      const subscriptionEnd = new Date(user.subscriptionEndDate).toLocaleDateString();
      bot.sendMessage(chatId, `Ваша ${user.subscriptionType.toUpperCase()} підписка активна до ${subscriptionEnd}.`);
    } else {
      bot.sendMessage(chatId, 'У вас немає активної підписки.');
    }
  } catch (error) {
    console.error('Помилка перевірки статусу:', error);
    bot.sendMessage(chatId, 'Виникла помилка при перевірці статусу підписки.');
  }
});

bot.onText(/\/admin_check/, async (msg) => {
  const chatId = msg.chat.id;
  if (msg.from.id.toString() === developerId) {
    const config = {
      privilegedUserIds,
      developerId,
      // Додайте інші важливі конфігураційні параметри
    };
    bot.sendMessage(chatId, `Поточні налаштування:\n${JSON.stringify(config, null, 2)}`);
  } else {
    bot.sendMessage(chatId, 'У вас немає доступу до цієї команди.');
  }
});

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

bot.onText(/\/portfolio/, async (msg) => {
  const chatId = msg.chat.id;
  // TODO: Реалізувати логіку управління портфелем
  bot.sendMessage(chatId, 'Функція управління портфелем знаходиться в розробці.');
});

bot.onText(/\/settings/, async (msg) => {
  const chatId = msg.chat.id;
  // TODO: Реалізувати логіку налаштувань користувача
  bot.sendMessage(chatId, 'Налаштування користувача:\n1. Частота сигналів: Всі\n2. Сповіщення: Увімкнено');
});

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

bot.onText(/\/mystatus/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const user = await userService.getUserByTelegramId(msg.from.id.toString());
    if (user && user.isSubscribed) {
      const endDate = new Date(user.subscriptionEndDate).toLocaleDateString();
      bot.sendMessage(chatId, `Ваша ${user.subscriptionType} підписка активна до ${endDate}.`);
    } else {
      bot.sendMessage(chatId, 'У вас немає активної підписки. Використовуйте /subscribe для перегляду доступних опцій.');
    }
  } catch (error) {
    console.error('Помилка перевірки статусу:', error);
    bot.sendMessage(chatId, 'Виникла помилка при перевірці статусу підписки.');
  }
});

bot.onText(/\/checksignal/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const hasAccess = await userService.checkAccess(chatId.toString(), 'FUTURES_SIGNALS');
    if (hasAccess) {
      bot.sendMessage(chatId, "У вас є доступ до ф'ючерсних сигналів.");
    } else {
      bot.sendMessage(chatId, "У вас немає доступу до ф'ючерсних сигналів. Оформіть відповідну підписку.");
    }
  } catch (error) {
    console.error('Помилка обробки команди /checksignal:', error);
  }
});

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