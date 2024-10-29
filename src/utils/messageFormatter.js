// src/utils/messageFormatter.js
const formatSignalMessage = (signal, type = 'new') => {
    let message = '';
    
    switch (type) {
      case 'new':
        message = `
  🚨 Новий ${signal.type === 'FUTURES' ? "ф'ючерсний" : 'спотовий'} сигнал
  
  📊 Пара: ${signal.pair}
  ${signal.direction === 'LONG' ? '📈 LONG' : '📉 SHORT'}
  💰 Ціна входу: $${signal.entryPrice}
  🎯 Take Profit: $${signal.takeProfit}
  🛑 Stop Loss: $${signal.stopLoss}
  ${signal.type === 'FUTURES' ? `📊 Leverage: ${signal.leverage}x\n` : ''}
  ⏰ Timeframe: ${signal.timeframe}
  
  ${signal.description || ''}
  
  ⚠️ Ризик менеджмент:
  - Розмір позиції: 1-2% від депозиту
  - Обов'язково встановлюйте Stop Loss
  - Не входьте після різкого руху
  
  📝 ID: #${signal.id}
        `;
        break;
  
      case 'update':
        message = `
  📝 Оновлення сигналу #${signal.id}
  
  ${signal.pair} | ${signal.direction}
  
  🔄 Оновлені значення:
  ${signal.takeProfit ? `• Take Profit: $${signal.takeProfit}\n` : ''}
  ${signal.stopLoss ? `• Stop Loss: $${signal.stopLoss}\n` : ''}
  ${signal.description ? `\n📌 ${signal.description}` : ''}
        `;
        break;
  
      case 'close':
        const result = signal.result > 0 ? `✅ +${signal.result}%` : `❌ ${signal.result}%`;
        message = `
  🏁 Закриття сигналу #${signal.id}
  
  📊 ${signal.pair} | ${signal.direction}
  💵 Результат: ${result}
  💰 Ціна виходу: $${signal.exitPrice}
  
  ${signal.closeNote ? `📝 ${signal.closeNote}` : ''}
        `;
        break;
  
      default:
        message = 'Невідомий тип повідомлення';
    }
  
    return message.trim();
  };
  
  const formatNewsMessage = (news) => {
    return `
  📰 ${news.title}
  
  ${news.content}
  
  ${news.tags ? `🏷 ${news.tags.map(tag => `#${tag}`).join(' ')}` : ''}
  ${news.source ? `\n📎 Джерело: ${news.source}` : ''}
    `.trim();
  };
  
  const formatSubscriptionMessage = (subscription) => {
    return `
  ✨ Ваша підписка ${subscription.type}
  
  📅 Активна до: ${new Date(subscription.endDate).toLocaleDateString()}
  ⏰ Залишилось днів: ${subscription.daysLeft}
  
  ${subscription.features.map(feature => `✓ ${feature}`).join('\n')}
    `.trim();
  };
  
  const formatErrorMessage = (error) => {
    return `
  ❌ Помилка
  
  ${error.message}
  ${error.details ? `\nДеталі: ${error.details}` : ''}
  
  Якщо проблема повторюється, зв'яжіться з підтримкою.
    `.trim();
  };
  
  module.exports = {
    formatSignalMessage,
    formatNewsMessage,
    formatSubscriptionMessage,
    formatErrorMessage
  };