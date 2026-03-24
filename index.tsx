
import './index.css';
import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Lazy load pages for code-splitting
const ServicesOverview = lazy(() => import('./pages/ServicesOverview'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Studio = lazy(() => import('./pages/Studio'));
const Contact = lazy(() => import('./pages/Contact'));
const Packages = lazy(() => import('./pages/Packages'));
const App = lazy(() => import('./App'));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #ffffff, #F9F9F9)'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #F2B705',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Services overview - main landing page */}
          <Route path="/" element={<ServicesOverview />} />
          {/* Individual service detail pages */}
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          {/* Packages landing page */}
          <Route path="/packages" element={<Packages />} />
          {/* Original San Diego Mobile Lab landing page (not linked from main site) */}
          <Route path="/mobile-lab" element={<App />} />
          {/* Brand Studio - Client CMS */}
          <Route path="/studio" element={<Studio />} />
          {/* Contact page */}
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
