// src/middleware/errorHandler.js
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if (process.env.NODE_ENV === 'development') {
      // Детальна помилка для розробки
      sendErrorDev(err, req, res);
    } else {
      // Безпечна помилка для продакшену
      sendErrorProd(err, req, res);
    }
  };
  
  const sendErrorDev = (err, req, res) => {
    // API помилка
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    }
  
    // Помилка в адмінці або веб-додатку
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      layout: false,
      title: 'Something went wrong!',
      msg: err.message,
      error: err,
      stack: err.stack
    });
  };
  
  const sendErrorProd = (err, req, res) => {
    // A) API помилка
    if (req.originalUrl.startsWith('/api')) {
      // Операційна, передбачувана помилка
      if (err.isOperational) {
        return res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
      }
      // Програмна або інша непередбачувана помилка
      console.error('ERROR 💥', err);
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  
    // B) Помилка в адмінці або веб-додатку
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        layout: false,
        title: 'Something went wrong!',
        msg: err.message
      });
    }
    
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      layout: false,
      title: 'Something went wrong!',
      msg: 'Please try again later.'
    });
  };
  
  // Обробка специфічних помилок
  const handleDBValidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  };
  
  const handleDBDuplicateError = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  };
  
  const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);
  
  const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);
  
  // Головний middleware для обробки помилок
  const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    if (error.name === 'ValidationError') error = handleDBValidationError(error);
    if (error.code === 11000) error = handleDBDuplicateError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  
    errorHandler(error, req, res, next);
  };
  
  // Views для помилок
  const errorViews = {
    // src/admin/views/error.ejs
    admin: `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Error</title>
    <link href="/css/admin.css" rel="stylesheet">
  </head>
  <body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error
          </h2>
          <div class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <%= msg %>
            <% if (process.env.NODE_ENV === 'development' && error) { %>
              <pre class="mt-4 text-sm overflow-x-auto"><%= error.stack %></pre>
            <% } %>
          </div>
          <div class="mt-4 text-center">
            <a href="/admin" class="text-blue-600 hover:text-blue-500">
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `,
  
    // src/webApp/views/error.ejs
    webapp: `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Error</title>
    <link href="/styles.css" rel="stylesheet">
  </head>
  <body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full space-y-8 text-center">
        <div class="bg-white p-8 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h2>
          <p class="text-gray-600 mb-6"><%= msg %></p>
          <button onclick="window.Telegram.WebApp.close()" 
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  </body>
  </html>
  `
  };
  
  module.exports = {
    AppError,
    globalErrorHandler,
    errorViews
  };