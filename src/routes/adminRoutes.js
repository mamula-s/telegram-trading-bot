const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const basicAuth = require('express-basic-auth');
const userService = require('../services/userService');
const signalService = require('../services/signalService');
const botService = require('../services/botService');

// Базова аутентифікація
const auth = basicAuth({
    users: { 'admin': 'password' }, 
    challenge: true,
    realm: 'Admin Panel'
});

// Застосовуємо аутентифікацію до всіх роутів
router.use(auth);

// Налаштування multer для завантаження зображень
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Головна сторінка адмін-панелі
router.get('/', (req, res) => {
  res.sendFile('admin.html', { root: './src/public' });
});

// API для отримання списку користувачів
router.get('/api/users', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання користувачів' });
  }
});

// API для створення нового сигналу
router.post('/api/signals', upload.single('image'), async (req, res) => {
  try {
    const signalData = req.body;
    if (req.file) {
      signalData.imageUrl = `/uploads/${req.file.filename}`;
    }
    const signal = await signalService.createSignal(signalData);
    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: 'Помилка створення сигналу' });
  }
});

// API для отримання всіх сигналів
router.get('/api/signals', async (req, res) => {
  try {
    const signals = await signalService.getAllSignals();
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання сигналів' });
  }
});

// API для отримання конкретного сигналу
router.get('/api/signals/:id', async (req, res) => {
  try {
    const signal = await signalService.getSignalById(req.params.id);
    if (!signal) {
      return res.status(404).json({ error: 'Сигнал не знайдено' });
    }
    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання сигналу' });
  }
});

// API для оновлення сигналу
router.put('/api/signals/:id', upload.single('image'), async (req, res) => {
  try {
    const signalData = req.body;
    if (req.file) {
      signalData.imageUrl = `/uploads/${req.file.filename}`;
    }
    const updatedSignal = await signalService.updateSignal(req.params.id, signalData);
    res.json(updatedSignal);
  } catch (error) {
    res.status(500).json({ error: 'Помилка оновлення сигналу' });
  }
});

// API для видалення сигналу
router.delete('/api/signals/:id', async (req, res) => {
  try {
    await signalService.deleteSignal(req.params.id);
    res.json({ message: 'Сигнал успішно видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка видалення сигналу' });
  }
});

// API для відправки сигналу користувачам
router.post('/api/signals/:id/publish', async (req, res) => {
    try {
      const signal = await signalService.getSignalById(req.params.id);
      if (!signal) {
        return res.status(404).json({ error: 'Сигнал не знайдено' });
      }
      await botService.sendSignalToUsers(signal);
      await signalService.updateSignal(req.params.id, { published: true });
      res.json({ message: 'Сигнал успішно опубліковано' });
    } catch (error) {
      console.error('Помилка публікації сигналу:', error);
      res.status(500).json({ error: 'Помилка публікації сигналу' });
    }
  });

module.exports = router;