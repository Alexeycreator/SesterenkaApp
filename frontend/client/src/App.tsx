import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Location, useNavigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import {
  MainPage,
  NewsPage,
  InformationPage,
  HelpPage,
  CatalogPage,
  AccountPage,
  PrivacyPolicyPage,
  TermsOfUsePage,
  OrderItemsPage,
} from './components/pages/Index';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import OrderPage from './components/pages/Order/OrderPage';
import NotFoundPage from './components/pages/NotFound/NotFoundPage';
import OrderDetailsPage from './components/pages/Order/OrderDetailsPage';
import ServerUnavailablePage from './components/pages/ServerUnavailable/ServerUnavailablePage';
import { useServerStatus } from './components/pages/ServerUnavailable/hooks/useServerStatus';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ScrollToTopProps {
  location: Location;
}

const ScrollToTop = ({ location }: ScrollToTopProps) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location]);

  return null;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isServerAvailable, checking, checkServer } = useServerStatus();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!checking && isServerAvailable && !isInitialized) {
      setIsInitialized(true);
      navigate('/', { replace: true });
    }
  }, [checking, isServerAvailable, navigate, isInitialized]);

  // Слушаем событие для повторной проверки сервера (например, после обновления данных)
  useEffect(() => {
    const handleRecheckServer = () => {
      checkServer();
    };

    window.addEventListener('recheckServer', handleRecheckServer);
    window.addEventListener('authChange', handleRecheckServer);
    window.addEventListener('cartUpdated', handleRecheckServer);

    return () => {
      window.removeEventListener('recheckServer', handleRecheckServer);
      window.removeEventListener('authChange', handleRecheckServer);
      window.removeEventListener('cartUpdated', handleRecheckServer);
    };
  }, [checkServer]);

  if (checking) {
    return (
      <div className="app-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #F5F0E5 0%, #F0E5D5 50%, #E5D5C5 100%)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
            <p>Проверка соединения с сервером...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isServerAvailable) {
    return <ServerUnavailablePage />;
  }

  return (
    <AuthProvider>
      <div className="app-container">
        <Header />
        <ScrollToTop location={location} />
        <main className="app-main">
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<MainPage />} />
            <Route path='/news' element={<NewsPage />} />
            <Route path='/information' element={<InformationPage />} />
            <Route path='/help' element={<HelpPage />} />
            <Route path='/catalog' element={<CatalogPage />} />
            <Route path='/personalAccount' element={<AccountPage />} />
            <Route path='/orderItems' element={<OrderItemsPage />} />
            <Route path='/order' element={<OrderPage />} />
            <Route path='/order/:id' element={<OrderDetailsPage />} />
            <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
            <Route path='/terms-of-use' element={<TermsOfUsePage />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;