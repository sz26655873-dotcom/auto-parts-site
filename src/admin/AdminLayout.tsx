/**
 * Admin layout — persistent sidebar navigation + top bar + content outlet.
 *
 * Used as a wrapper around all protected admin pages. The sidebar provides
 * navigation between Dashboard, Products, Contact, Company, and Data pages,
 * plus a "View Site" link back to the front-end. The top bar shows the
 * admin label and a logout button.
 */

import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import BusinessIcon from '@mui/icons-material/Business';
import StorageIcon from '@mui/icons-material/Storage';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { setAuthenticated } from './adminStorage';

/** Sidebar width in pixels. */
const DRAWER_WIDTH = 260;

/** Navigation items for the admin sidebar. */
const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'Products', path: '/admin/products', icon: <InventoryIcon /> },
  { label: 'Contact Info', path: '/admin/contact', icon: <ContactPhoneIcon /> },
  { label: 'Company Info', path: '/admin/company', icon: <BusinessIcon /> },
  { label: 'Data Management', path: '/admin/data', icon: <StorageIcon /> },
];

/**
 * Admin layout with responsive sidebar and top bar.
 * On mobile, the sidebar collapses into a temporary drawer.
 */
function AdminLayout(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const handleDrawerToggle = (): void => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = (): void => {
    setAuthenticated(false);
    navigate('/admin', { replace: true });
  };

  /** Determines whether a nav item is the active route. */
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  /** Renders the sidebar content (shared between permanent and mobile drawers). */
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 1, color: 'secondary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Admin
          <Box component="span" sx={{ color: 'secondary.main' }}>
            Panel
          </Box>
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={isActive(item.path)}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                  '&:hover': { backgroundColor: 'primary.light' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <OpenInNewIcon />
            </ListItemIcon>
            <ListItemText primary="View Site" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Permanent sidebar (desktop) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="default"
          elevation={1}
          sx={{ backgroundColor: '#fff' }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: 'primary.main' }}>
              {navItems.find((item) => isActive(item.path))?.label ?? 'Admin'}
            </Typography>
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              color="primary"
              variant="outlined"
              size="small"
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default AdminLayout;
