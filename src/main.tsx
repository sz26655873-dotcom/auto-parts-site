import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './i18n/LanguageContext';
import { AdminDataProvider } from './admin/AdminDataContext';
import App from './App';
import './index.css';

// Version check: compare build version with localStorage.
// If different, clear cache and reload to ensure users always see latest version.
declare const __APP_VERSION__: string;
const STORED_VERSION_KEY = 'altai_app_version';
const currentVersion = __APP_VERSION__;
const storedVersion = localStorage.getItem(STORED_VERSION_KEY);

if (storedVersion !== currentVersion) {
  // New version detected — clear all caches and force reload
  localStorage.setItem(STORED_VERSION_KEY, currentVersion);
  // Clear service worker caches if any
  if ('caches' in window) {
    caches.keys().then(names => names.forEach(name => caches.delete(name)));
  }
  // Force reload from server (not cache)
  window.location.reload();
}

/**
 * Application entry point.
 *
 * Provider hierarchy (outermost → innermost):
 *   BrowserRouter     — enables React Router navigation
 *   HelmetProvider     — manages document head tags (SEO meta, JSON-LD)
 *   LanguageProvider   — language state, translation function, RTL direction
 *   AdminDataProvider  — localStorage-backed site data (products, contact, company)
 *   App                — routes + theme
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <LanguageProvider>
          <AdminDataProvider>
            <App />
          </AdminDataProvider>
        </LanguageProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
