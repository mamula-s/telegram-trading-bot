const Signal = require('../models/Signal'); 

const createSignal = async (signalData) => {
    try {
      console.log('Дані сигналу в сервісі:', signalData); // Додамо лог для перевірки
      const signal = new Signal(signalData);
      await signal.save();
      return signal;
    } catch (error) {
      console.error('Помилка створення сигналу:', error);
      throw error;
    }
  };

const getAllSignals = async () => {
  try {
    return await Signal.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Помилка отримання сигналів:', error);
    throw error;
  }
};

const getSignalById = async (id) => {
  try {
    return await Signal.findById(id);
  } catch (error) {
    console.error('Помилка отримання сигналу:', error);
    throw error;
  }
};

const updateSignal = async (id, updateData) => {
  try {
    return await Signal.findByIdAndUpdate(id, updateData, { new: true });
  } catch (error) {
    console.error('Помилка оновлення сигналу:', error);
    throw error;
  }
};

const deleteSignal = async (id) => {
  try {
    await Signal.findByIdAndDelete(id);
  } catch (error) {
    console.error('Помилка видалення сигналу:', error);
    throw error;
  }
};

module.exports = {
  createSignal,
  getAllSignals,
  getSignalById,
  updateSignal,
  deleteSignal
};