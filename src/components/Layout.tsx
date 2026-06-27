/**
 * Layout — shared page layout for all front-end routes.
 *
 * Renders the Navbar at the top, the routed page content via <Outlet />,
 * the Footer at the bottom, the FloatingInquiry button, and a floating
 * Home button (visible only on non-home pages).
 * Admin routes use their own layout and bypass this component.
 */

import { Outlet, useLocation, Link } from 'react-router-dom';
import { Fab, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useLanguage } from '../i18n/LanguageContext';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingInquiry from './FloatingInquiry';
import AiChatWidget from './AiChatWidget';

/**
 * Floating Home button — shows on every page except the homepage.
 * Positioned at bottom-left (LTR) / bottom-right (RTL) to avoid overlap
 * with the FloatingInquiry button on the opposite side.
 */
function FloatingHomeButton(): JSX.Element | null {
  const { isRTL, t } = useLanguage();
  const location = useLocation();

  // Don't show on homepage
  if (location.pathname === '/') return null;

  return (
    <Tooltip title={t('nav.home')} arrow>
      <Fab
        component={Link}
        to="/"
        size="medium"
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          [isRTL ? 'right' : 'left']: 24,
          zIndex: 1300,
          boxShadow: '0 2px 12px rgba(10,35,66,0.3)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 4px 20px rgba(10,35,66,0.5)',
          },
        }}
      >
        <HomeIcon />
      </Fab>
    </Tooltip>
  );
}

/**
 * Standard layout wrapper for all public-facing pages.
 */
function Layout(): JSX.Element {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <AiChatWidget />
      <FloatingInquiry />
      <FloatingHomeButton />
    </>
  );
}

export default Layout;
