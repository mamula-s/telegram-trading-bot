const subscriptions = {
    FUTURES_SIGNALS: {
      id: 'FUTURES_SIGNALS',
      name: "Ф'ючерсні сигнали",
      price: 50,
      duration: 30, // тривалість у днях
      description: "Доступ до ф'ючерсних торгових сигналів",
      features: ["Ф'ючерсні сигнали", "Аналіз ринку ф'ючерсів"]
    },
    SPOT_SIGNALS: {
      id: 'SPOT_SIGNALS',
      name: 'Спотові сигнали',
      price: 50,
      duration: 30,
      description: 'Доступ до спотових торгових сигналів',
      features: ['Спотові сигнали', 'Аналіз спотового ринку']
    },
    EDUCATIONAL: {
      id: 'EDUCATIONAL',
      name: 'Навчальні матеріали',
      price: 5,
      duration: 30,
      description: 'Доступ до навчальних матеріалів',
      features: ['Відеоуроки', 'Текстові матеріали', 'Вебінари']
    },
    FULL: {
      id: 'FULL',
      name: 'Повна підписка',
      price: 100,
      duration: 30,
      description: 'Повний доступ до всіх функцій',
      features: ["Ф'ючерсні сигнали", 'Спотові сигнали', 'Навчальні матеріали', 'Преміум підтримка']
    }
  };
  
  module.exports = subscriptions;