import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/tailwind.css';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing React app...');
  
  const container = document.getElementById('root');
  if (!container) {
    console.error('Root element not found!');
    return;
  }

  const root = createRoot(container);
  
  root.render(
    <BrowserRouter basename="/webapp">
      <App />
    </BrowserRouter>
  );

  console.log('React app initialized');
});