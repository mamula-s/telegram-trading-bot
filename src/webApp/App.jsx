// src/webApp/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ApiProvider } from './contexts/ApiContext';
import { ErrorBoundary } from 'react-error-boundary';

// Pages
import MainPage from './pages/MainPage';
import FuturesPage from './pages/FuturesPage';
import SpotPage from './pages/SpotPage';
import EducationPage from './pages/EducationPage';
import ReferralPage from './pages/ReferralPage';
import ChatsPage from './pages/ChatsPage';
import PaymentPage from './pages/PaymentPage';
import Layout from './components/Layout';

const ErrorFallback = ({error}) => {
  return (
    <div role="alert" className="p-4 text-red-500">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter basename="/webapp">
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
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </ApiProvider>
          </WebSocketProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;