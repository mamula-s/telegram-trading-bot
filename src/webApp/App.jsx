import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MainPage from './pages/MainPage';
import FuturesPage from './pages/FuturesPage';
import SpotPage from './pages/SpotPage';
import EducationPage from './pages/EducationPage';
import ReferralPage from './pages/ReferralPage';

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<MainPage />} />
        <Route path="futures" element={<FuturesPage />} />
        <Route path="spot" element={<SpotPage />} />
        <Route path="education" element={<EducationPage />} />
        <Route path="referral" element={<ReferralPage />} />
      </Route>
    </Routes>
  );
};

export default App;