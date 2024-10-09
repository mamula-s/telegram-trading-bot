const authMiddleware = (req, res, next) => {
    // TODO: Реалізувати перевірку автентифікації
    // Наприклад, перевірка сесії або JWT токену
    next();
  };
  
  module.exports = authMiddleware;