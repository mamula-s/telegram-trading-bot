import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/tailwind.css';

console.log('React initialization starting...');

try {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }

  console.log('Creating React root...');
  const root = createRoot(container);

  console.log('Rendering app...');
  root.render(
    <React.StrictMode>
      <BrowserRouter basename="/webapp">
        <div className="bg-white min-h-screen text-black p-4">
          <h1 className="text-2xl font-bold mb-4">Trading Bot</h1>
          <App />
        </div>
      </BrowserRouter>
    </React.StrictMode>
  );

  console.log('Render complete');
} catch (error) {
  console.error('Error initializing React:', error);
  // Показати помилку на сторінці
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '20px';
  errorDiv.textContent = `Error: ${error.message}`;
  document.body.appendChild(errorDiv);
}