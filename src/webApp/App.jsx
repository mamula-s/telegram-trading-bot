import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MainPage from './pages/MainPage';
import FuturesPage from './pages/FuturesPage';
// TODO: Import other pages

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/futures" element={<FuturesPage />} />
        {/* TODO: Add other routes */}
      </Routes>
    </Layout>
  );
};

export default App;