import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MainPage from './pages/MainPage';
import FuturesPage from './pages/FuturesPage';
import { NotificationProvider } from './contexts/NotificationContext';

const App = () => {
  return (
    <NotificationProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/futures" element={<FuturesPage />} />
          {/* TODO: Add other routes */}
        </Routes>
      </Layout>
    </NotificationProvider>
  );
};

export default App;