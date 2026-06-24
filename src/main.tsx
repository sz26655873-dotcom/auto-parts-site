import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AdminDataProvider } from './admin/AdminDataContext';
import App from './App';
import './index.css';

/**
 * Application entry point.
 *
 * Provider hierarchy (outermost → innermost):
 *   BrowserRouter    — enables React Router navigation
 *   LanguageProvider — language state, translation function, RTL direction
 *   AdminDataProvider — localStorage-backed site data (products, contact, company)
 *   App              — routes + theme
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AdminDataProvider>
          <App />
        </AdminDataProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
