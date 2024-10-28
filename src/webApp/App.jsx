import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ApiProvider } from './contexts/ApiContext';
import Layout from './components/Layout';

// Pages
import MainPage from './pages/MainPage';
import FuturesPage from './pages/FuturesPage';
import SpotPage from './pages/SpotPage';
import EducationPage from './pages/EducationPage';
import ReferralPage from './pages/ReferralPage';
import AirdropsPage from './pages/AirdropsPage';
import ChatsPage from './pages/ChatsPage';
import PaymentPage from './pages/PaymentPage';

const App = () => {
  return (
    <ApiProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route path="futures" element={<FuturesPage />} />
          <Route path="spot" element={<SpotPage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="referral" element={<ReferralPage />} />
          <Route path="airdrops" element={<AirdropsPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="payment" element={<PaymentPage />} />
        </Route>
      </Routes>
    </ApiProvider>
  );
};

export default App;