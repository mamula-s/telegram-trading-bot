import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ApiProvider } from './contexts/ApiContext';

// Pages
import MainPage from './pages/MainPage';
import FuturesPage from './pages/FuturesPage';
import SpotPage from './pages/SpotPage';
import EducationPage from './pages/EducationPage';
import ReferralPage from './pages/ReferralPage';
import ChatsPage from './pages/ChatsPage';
import PaymentPage from './pages/PaymentPage';
import Layout from './components/Layout';

const App = () => {
  return (
    <NotificationProvider>
      <WebSocketProvider>
        <ApiProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<MainPage />} />
              <Route path="futures" element={<FuturesPage />} />
              <Route path="spot" element={<SpotPage />} />
              <Route path="education" element={<EducationPage />} />
              <Route path="referral" element={<ReferralPage />} />
              <Route path="chats" element={<ChatsPage />} />
              <Route path="payment" element={<PaymentPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </ApiProvider>
      </WebSocketProvider>
    </NotificationProvider>
  );
};

export default App;