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
  PrivacyPolicyPage,
  TermsOfUsePage,
  SaleItemsPage,
  OrderItemsPage,
} from './components/pages/Index';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import OrderPage from './components/pages/Order/OrderPage';
import NotFoundPage from './components/pages/NotFound/NotFoundPage';
import OrderDetailsPage from './components/pages/Order/OrderDetailsPage';

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
            <Route path='/privacy_policy' element={<PrivacyPolicyPage />} />
            <Route path='/terms_of_use' element={<TermsOfUsePage />} />
            <Route path='/sale_items' element={<SaleItemsPage />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;