// src/bot/handlers/chatHandler.js

const handleNewChat = async (bot, chat) => {
    const users = await userService.getSubscribedUsers();
    const message = formatChatMessage(chat);
    
    for (const user of users) {
      try {
        await bot.sendMessage(user.telegramId, message, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Приєднатися',
                url: chat.link
              }]
            ]
          }
        });
      } catch (error) {
        console.error(`Error sending chat notification to user ${user.telegramId}:`, error);
      }
    }
  };
  
  const formatChatMessage = (chat) => {
    return `
  🆕 <b>Новий ${chat.type === 'channel' ? 'канал' : 'чат'}</b>
  
  <b>${chat.name}</b>
  ${chat.description}
  
  ${chat.isPrivate ? '🔒 Приватний' : '🌐 Публічний'}
  👥 ${chat.members} учасників
    `;
  };