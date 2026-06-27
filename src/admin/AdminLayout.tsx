/**
 * Admin layout — persistent sidebar navigation + top bar + content outlet.
 *
 * Used as a wrapper around all protected admin pages. The sidebar provides
 * navigation between Dashboard, Products, Contact, Company, and Data pages,
 * plus a "View Site" link back to the front-end. The top bar shows the
 * admin label, a network status indicator, and a logout button.
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
  Tooltip,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import BusinessIcon from '@mui/icons-material/Business';
import StorageIcon from '@mui/icons-material/Storage';
import InboxIcon from '@mui/icons-material/Inbox';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BarChartIcon from '@mui/icons-material/BarChart';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import { clearAuthToken } from './adminStorage';
import { useAdminData } from './AdminDataContext';

/** Sidebar width in pixels. */
const DRAWER_WIDTH = 260;

/** Navigation items for the admin sidebar. */
const navItems = [
  { label: '控制台', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: '询盘管理', path: '/admin/inquiries', icon: <InboxIcon /> },
  { label: '产品管理', path: '/admin/products', icon: <InventoryIcon /> },
  { label: '批量添加', path: '/admin/bulk-upload', icon: <UploadFileIcon /> },
  { label: '联系方式', path: '/admin/contact', icon: <ContactPhoneIcon /> },
  { label: '公司信息', path: '/admin/company', icon: <BusinessIcon /> },
  { label: '数据管理', path: '/admin/data', icon: <StorageIcon /> },
  { label: '访客数据', path: '/admin/analytics', icon: <BarChartIcon /> },
];

/**
 * Network status indicator — displays in the top bar.
 * online → green dot, offline → red dot, syncing → yellow spinner
 */
function NetworkStatusIndicator(): JSX.Element {
  const { networkStatus } = useAdminData();

  if (networkStatus === 'syncing') {
    return (
      <Tooltip title="正在同步数据...">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CircularProgress size={16} sx={{ color: 'warning.main' }} />
          <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>
            同步中
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  if (networkStatus === 'offline') {
    return (
      <Tooltip title="网络离线 — 使用缓存数据">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WifiOffIcon sx={{ fontSize: 18, color: 'error.main' }} />
          <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
            离线
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  // online
  return (
    <Tooltip title="已连接云端数据库">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <WifiIcon sx={{ fontSize: 18, color: 'success.main' }} />
        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
          已连接
        </Typography>
      </Box>
    </Tooltip>
  );
}

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
    clearAuthToken();
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
          管理后台
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
            <ListItemText primary="查看网站" />
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
              {navItems.find((item) => isActive(item.path))?.label ?? '管理后台'}
            </Typography>
            {/* Network status indicator */}
            <Box sx={{ mr: 2 }}>
              <NetworkStatusIndicator />
            </Box>
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              color="primary"
              variant="outlined"
              size="small"
            >
              退出登录
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
