
import './index.css';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load pages for code-splitting
const ServicesOverview = lazy(() => import('./pages/ServicesOverview'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const App = lazy(() => import('./App'));

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Services overview - main landing page */}
          <Route path="/" element={<ServicesOverview />} />
          {/* Individual service detail pages */}
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          {/* Original San Diego Mobile Lab landing page (not linked from main site) */}
          <Route path="/mobile-lab" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
