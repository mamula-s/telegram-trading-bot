import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import App from './App';
import './styles/tailwind.css';

// Ініціалізуємо додаток
const container = document.getElementById('root');
if (!container) {
    throw new Error('Failed to find the root element');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);