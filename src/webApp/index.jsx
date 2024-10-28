import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/tailwind.css';

const initApp = () => {
  try {
    console.log('Initializing app...');
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }

    const root = createRoot(container);
    
    root.render(
      <React.StrictMode>
        <BrowserRouter basename="/webapp">
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    const errorDiv = document.createElement('div');
    errorDiv.style.padding = '20px';
    errorDiv.style.color = 'red';
    errorDiv.textContent = `Error: ${error.message}`;
    document.body.appendChild(errorDiv);
  }
};

// Ініціалізуємо додаток після завантаження DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Можемо ігнорувати помилку про ethereum provider
window.addEventListener('error', function(event) {
  if (event.message.includes('ethereum.initializeProvider')) {
    event.preventDefault();
  }
});

// Встановлюємо колір теми для Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
  document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
  document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
  document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);
}