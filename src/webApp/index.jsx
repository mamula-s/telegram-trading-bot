import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './styles/tailwind.css';

const ErrorFallback = ({ error }) => {
  return (
    <div className="p-4 text-red-500">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
};

// Ініціалізація Telegram WebApp
const initTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    try {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Встановлюємо кольори теми
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#000000');
      document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams?.hint_color || '#999999');
      document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams?.link_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor || '#ffffff');
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
    }
  }
};

const initApp = () => {
  try {
    console.log('Initializing app...');
    
    // Ініціалізуємо Telegram WebApp
    initTelegramWebApp();
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }

    const root = createRoot(container);
    
    root.render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <React.StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </React.StrictMode>
      </ErrorBoundary>
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

// Ігноруємо помилку ethereum provider
window.addEventListener('error', function(event) {
  if (event.message.includes('ethereum.initializeProvider')) {
    event.preventDefault();
  }
});

// Ініціалізуємо додаток після завантаження DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}