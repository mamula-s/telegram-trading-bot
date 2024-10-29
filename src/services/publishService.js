// src/services/publishService.js
const Redis = require('redis');
const { promisify } = require('util');
const WebSocket = require('ws');

class PublishService {
  constructor() {
    // Redis для кешування і швидкої доставки даних
    this.redis = Redis.createClient(process.env.REDIS_URL);
    this.redisGet = promisify(this.redis.get).bind(this.redis);
    this.redisSet = promisify(this.redis.set).bind(this.redis);

    // WebSocket сервер для real-time оновлень
    this.wss = new WebSocket.Server({ noServer: true });
    this.clients = new Map(); // Зберігаємо активні з'єднання
  }

  // Публікація сигналу
  async publishSignal(signal, options = {}) {
    try {
      const { notifyUsers = true, updateWebApp = true } = options;

      // Зберігаємо в Redis
      await this.redisSet(`signal:${signal.id}`, JSON.stringify(signal));

      // Відправляємо через WebSocket для WebApp
      if (updateWebApp) {
        this.broadcastToWebApp('signal_update', {
          type: 'new_signal',
          data: signal
        });
      }

      // Публікуємо в канал Telegram
      if (notifyUsers) {
        await botService.broadcastSignal(signal);
      }

      return true;
    } catch (error) {
      console.error('Error publishing signal:', error);
      throw error;
    }
  }

  // Оновлення статусу сигналу
  async updateSignalStatus(signalId, status, result) {
    try {
      const signal = await signalService.updateSignal(signalId, {
        status,
        result
      });

      // Оновлюємо кеш
      await this.redisSet(`signal:${signalId}`, JSON.stringify(signal));

      // Сповіщаємо WebApp
      this.broadcastToWebApp('signal_update', {
        type: 'status_update',
        data: { signalId, status, result }
      });

      return signal;
    } catch (error) {
      console.error('Error updating signal status:', error);
      throw error;
    }
  }

  // Публікація новин
  async publishNews(news) {
    try {
      // Зберігаємо в БД
      const savedNews = await newsService.createNews(news);

      // Кешуємо
      await this.redisSet(`news:${savedNews.id}`, JSON.stringify(savedNews));

      // Відправляємо в WebApp
      this.broadcastToWebApp('news_update', {
        type: 'new_news',
        data: savedNews
      });

      return savedNews;
    } catch (error) {
      console.error('Error publishing news:', error);
      throw error;
    }
  }

  // Оновлення навчальних матеріалів
  async publishEducationalMaterial(material) {
    try {
      const savedMaterial = await educationalService.createMaterial(material);

      this.broadcastToWebApp('educational_update', {
        type: 'new_material',
        data: savedMaterial
      });

      return savedMaterial;
    } catch (error) {
      console.error('Error publishing educational material:', error);
      throw error;
    }
  }

  // WebSocket методи
  handleWebSocketConnection(ws, req) {
    const userId = req.user.id;
    this.clients.set(userId, ws);

    ws.on('close', () => {
      this.clients.delete(userId);
    });
  }

  broadcastToWebApp(event, data) {
    const message = JSON.stringify({ event, data });
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

module.exports = new PublishService();