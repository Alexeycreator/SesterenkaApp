import React, { useEffect } from 'react';
import { Route, Routes, useLocation, Location } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import {
  MainPage,
  NewsPage,
  InformationPage,
  HelpPage,
  CatalogPage,
  AccountPage,
  BasketPage,
  PrivacyPolicyPage,
  TermsOfUsePage,
  SaleItemsPage,
} from './components/pages/Index';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import './App.css';
import "../node_modules/bootstrap/dist/css/bootstrap.css";

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
  return (
    <>
      <AuthProvider>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #F5F0E5 0%, #F0E5D5 50%, #E5D5C5 100%)'
        }}>
          <Header />
          <ScrollToTop location={location} />
          <div style={{ flex: '1 0 auto', width: '100%' }}>
            <Routes location={location} key={location.pathname}>
              <Route path='/' element={<MainPage />} />
              <Route path='/news' element={<NewsPage />} />
              <Route path='/information' element={<InformationPage />} />
              <Route path='/help' element={<HelpPage />} />
              <Route path='/catalog' element={<CatalogPage />} />
              {/* описать пути для фильтров, например /catalog/фильтра/масляный, салонный и тд и для других запчастей также */}
              <Route path='/lk/:id' element={<AccountPage />} />
              <Route path='/basket/:id' element={<BasketPage />} />
              <Route path='/privacy_policy' element={<PrivacyPolicyPage />} />
              <Route path='/terms_of_use' element={<TermsOfUsePage />} />
              <Route path='/sale_items' element={<SaleItemsPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}

export default App;