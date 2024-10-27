import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainPage from '../pages/MainPage';
import FuturesPage from '../pages/FuturesPage';
import SpotPage from '../pages/SpotPage';
import EducationPage from '../pages/EducationPage';
import AirdropsPage from '../pages/AirdropsPage';
import ReferralPage from '../pages/ReferralPage';
import ChatsPage from '../pages/ChatsPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/futures" element={<FuturesPage />} />
        <Route path="/spot" element={<SpotPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/airdrops" element={<AirdropsPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;