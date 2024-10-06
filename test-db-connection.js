const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => {
    console.log('Успішне підключення до MongoDB');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Помилка підключення до MongoDB:', err);
  });