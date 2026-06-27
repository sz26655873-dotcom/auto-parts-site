import { useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { Routes, Route } from 'react-router-dom';
import AdminApp from './admin/AdminApp';
import { useLanguage } from './i18n/LanguageContext';
import { createAppTheme } from './theme';
import { ltrCache, rtlCache } from './cache';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Root application component.
 *
 * Configures the MUI theme direction and emotion cache based on the active
 * language (RTL for Arabic, LTR for all others), then renders the route tree:
 *   "/"                          → Home page
 *   "/products"                  → Product catalog
 *   "/products/category/:cat"    → Category listing
 *   "/products/:slug"            → Product detail
 *   "/about"                     → About page
 *   "/contact"                   → Contact page
 *   "/admin/*"                   → Admin backend (login, dashboard, managers)
 */
function App(): JSX.Element {
  const { isRTL } = useLanguage();

  const direction = isRTL ? 'rtl' : 'ltr';

  const theme = useMemo(() => createAppTheme(direction), [direction]);
  const cache = useMemo(() => (isRTL ? rtlCache : ltrCache), [isRTL]);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            {/* Category route must come before :slug to avoid mismatch */}
            <Route path="/products/category/:cat" element={<CategoryPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
