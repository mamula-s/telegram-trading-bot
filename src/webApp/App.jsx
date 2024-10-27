import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MainPage from './pages/MainPage';
import FuturesPage from './pages/FuturesPage';
import SpotPage from './pages/SpotPage';
import ReferralPage from './pages/ReferralPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainPage />} />
        <Route path="futures" element={<FuturesPage />} />
        <Route path="spot" element={<SpotPage />} />
        <Route path="referral" element={<ReferralPage />} />
        {/* TODO: Add other routes */}
      </Route>
    </Routes>
  );
};

export default App;