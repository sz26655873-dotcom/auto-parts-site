import { useMemo } from 'react';
import { Box } from '@mui/material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import Advantages from './components/Advantages';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminApp from './admin/AdminApp';
import { useLanguage } from './i18n/LanguageContext';
import { createAppTheme } from './theme';
import { ltrCache, rtlCache } from './cache';

/**
 * Front-end single-page site — all sections rendered in a scroll layout.
 * Displayed at the root route "/".
 */
function FrontendPage(): JSX.Element {
  return (
    <Box>
      <Navbar />
      <Hero />
      <Products />
      <Advantages />
      <About />
      <Contact />
      <Footer />
    </Box>
  );
}

/**
 * Root application component.
 *
 * Configures the MUI theme direction and emotion cache based on the active
 * language (RTL for Arabic, LTR for all others), then renders the route tree:
 *   "/"           → Front-end site (all sections)
 *   "/admin/*"    → Admin backend (login, dashboard, managers)
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
          <Route path="/" element={<FrontendPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
