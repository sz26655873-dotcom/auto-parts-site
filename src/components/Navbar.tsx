import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  Stack,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  Dialog,
  DialogContent,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TranslateIcon from '@mui/icons-material/Translate';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import {
  languageNames,
  type Language,
} from '../i18n/translations';

/** All supported languages for the dropdown selector. */
const supportedLanguages: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];

/** Navigation menu items with route paths and i18n keys. */
const navItems = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.products', href: '/products' },
  { key: 'nav.about', href: '/about' },
  { key: 'nav.contact', href: '/contact' },
];

/**
 * Language selector dropdown using MUI Select.
 * Displays each language in its own native name.
 */
function LanguageSelector({
  variant,
}: {
  variant: 'desktop' | 'mobile';
}): JSX.Element {
  const { lang, setLang } = useLanguage();

  const handleChange = (event: SelectChangeEvent): void => {
    setLang(event.target.value as Language);
  };

  const commonProps = {
    value: lang,
    onChange: handleChange,
    size: 'small' as const,
    IconComponent: TranslateIcon,
    renderValue: (value: string) => languageNames[value as Language],
  };

  if (variant === 'desktop') {
    return (
      <Select
        {...commonProps}
        sx={{
          color: '#fff',
          '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
          '& .MuiSelect-select': { py: 0.5, px: 1.5, fontSize: '0.85rem', fontWeight: 600 },
          minWidth: 90,
        }}
        MenuProps={{
          PaperProps: {
            sx: { mt: 1 },
          },
        }}
      >
        {supportedLanguages.map((code) => (
          <MenuItem key={code} value={code} sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
            {languageNames[code]}
          </MenuItem>
        ))}
      </Select>
    );
  }

  // Mobile variant: full-width inside the drawer
  return (
    <Select {...commonProps} fullWidth sx={{ fontSize: '0.9rem' }}>
      {supportedLanguages.map((code) => (
        <MenuItem key={code} value={code} sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
          {languageNames[code]}
        </MenuItem>
      ))}
    </Select>
  );
}

/**
 * Fixed top navigation bar with a contact info bar on top.
 * The contact bar shows WhatsApp number, phone, email, and QR codes directly.
 * Below is the standard logo + nav links + language selector.
 */
function Navbar(): JSX.Element {
  const { t, isRTL } = useLanguage();
  const { contactInfo } = useAdminData();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [qrDialog, setQrDialog] = useState<{ open: boolean; src: string; title: string }>({
    open: false,
    src: '',
    title: '',
  });

  const isHomePage = location.pathname === '/';

  /** Navigate to home or scroll to top if already on home */
  const handleGoHome = (e: React.MouseEvent): void => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // If not on home page, let the default Link navigation happen
  };

  const handleDrawerToggle = (): void => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle} role="presentation">
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              component={Link}
              to={item.href}
              onClick={(item.key === 'nav.home') ? handleGoHome : undefined}
            >
              <ListItemText primary={t(item.key)} />
            </ListItemButton>
          </ListItem>
        ))}
        {/* Language selector — stop propagation so it doesn't close the drawer */}
        <ListItem disablePadding>
          <Box
            sx={{ px: 2, py: 1.5, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <LanguageSelector variant="mobile" />
          </Box>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" color="primary" elevation={0} sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        {/* === Top contact bar === */}
          <Box
          sx={{
            background: 'linear-gradient(180deg, #1a237e 0%, #0A2342 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            py: 2,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Stack
              direction="row"
              spacing={6}
              sx={{
                alignItems: 'center',
              }}
            >
              {/* Left: contact info in one row */}
              <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
                {/* WhatsApp */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <WhatsAppIcon sx={{ fontSize: 34, color: '#25D366' }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.3rem', fontWeight: 700 }}>
                    WhatsApp
                  </Typography>
                  <Typography
                    component="a"
                    href={`https://wa.me/${contactInfo.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#fff',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      letterSpacing: '0.5px',
                      '&:hover': { color: '#25D366' },
                    }}
                  >
                    +{contactInfo.whatsapp}
                  </Typography>
                </Stack>

                {/* Separator */}
                <Box sx={{ width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)' }} />

                {/* WeChat */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                      component="svg"
                      viewBox="0 0 24 24"
                      sx={{ width: 32, height: 32, fill: '#07C160' }}
                    >
                      <path d="M8.691 2C4.768 2 1.588 4.558 1.588 7.708c0 1.75.962 3.313 2.48 4.376l-.62 1.87 2.18-1.094c.78.219 1.5.375 2.31.375.2 0 .4-.01.6-.02-.12-.39-.19-.8-.19-1.22 0-2.79 2.42-5.06 5.41-5.06.2 0 .4.01.59.03-.52-2.84-3.48-4.94-7.26-4.94zM6.09 6.06a.86.86 0 110-1.72.86.86 0 010 1.72zm5.2 0a.86.86 0 110-1.72.86.86 0 010 1.72z" />
                      <path d="M22.4 12.35c0-2.62-2.63-4.75-5.87-4.75s-5.87 2.13-5.87 4.75 2.63 4.75 5.87 4.75c.68 0 1.33-.1 1.93-.28l1.74.95-.48-1.58c1.37-.87 2.68-2.2 2.68-3.84zm-7.8-.5a.7.7 0 110-1.4.7.7 0 010 1.4zm3.86 0a.7.7 0 110-1.4.7.7 0 010 1.4z" />
                    </Box>
                  </Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.3rem', fontWeight: 700 }}>
                    WeChat
                  </Typography>
                  <Typography sx={{
                    color: '#fff',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                  }}>
                    {contactInfo.wechatId}
                  </Typography>
                </Stack>
              </Stack>

              {/* Vertical divider */}
              <Box sx={{ width: 1.5, height: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />

              {/* Right: two QR codes side by side */}
              <Stack direction="row" spacing={5} sx={{ alignItems: 'center' }}>
                {contactInfo.wechatQrImage && (
                  <Stack direction="column" spacing={2} sx={{ alignItems: 'center' }}>
                    <Tooltip title={t('contact.wechat')}>
                      {/* White background container to mask uneven QR borders */}
                      <Box
                        sx={{
                          width: 76,
                          height: 76,
                          borderRadius: '10px',
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: '2px solid rgba(255,255,255,0.3)',
                          transition: 'transform 0.2s, border-color 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            borderColor: '#07C160',
                          },
                          overflow: 'hidden',
                        }}
                        onClick={() =>
                          setQrDialog({ open: true, src: contactInfo.wechatQrImage, title: 'WeChat' })
                        }
                      >
                        <Box
                          component="img"
                          src={contactInfo.wechatQrImage}
                          alt="WeChat QR"
                          sx={{
                            width: '92%',
                            height: '92%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    </Tooltip>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>
                      WeChat
                    </Typography>
                  </Stack>
                )}

                {contactInfo.whatsappQrImage && (
                  <Stack direction="column" spacing={2} sx={{ alignItems: 'center' }}>
                    <Tooltip title="WhatsApp QR">
                      <Box
                        sx={{
                          width: 76,
                          height: 76,
                          borderRadius: '10px',
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: '2px solid rgba(255,255,255,0.3)',
                          transition: 'transform 0.2s, border-color 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            borderColor: '#25D366',
                          },
                          overflow: 'hidden',
                        }}
                        onClick={() =>
                          setQrDialog({ open: true, src: contactInfo.whatsappQrImage, title: 'WhatsApp' })
                        }
                      >
                        <Box
                          component="img"
                          src={contactInfo.whatsappQrImage}
                          alt="WhatsApp QR"
                          sx={{
                            width: '92%',
                            height: '92%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    </Tooltip>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>
                      WhatsApp
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* === Main nav bar === */}
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 } }}>
            <Box
              component={Link}
              to="/"
              onClick={handleGoHome}
              sx={{
                mr: 4,
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 32, color: 'secondary.main', mr: 1 }} />
              <Typography
                variant="h6"
                component="span"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  whiteSpace: 'nowrap',
                }}
              >
                Altai Auto Parts
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  component={Link}
                  to={item.href}
                  onClick={(item.key === 'nav.home') ? handleGoHome : undefined}
                  sx={{ color: '#fff', fontWeight: 500, minWidth: 'auto', textTransform: 'none' }}
                >
                  {t(item.key)}
                </Button>
              ))}
            </Box>

            {/* Mobile: phone icon shortcut */}
            <IconButton
              href={`https://wa.me/${contactInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#25D366' }}
            >
              <WhatsAppIcon />
            </IconButton>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <LanguageSelector variant="desktop" />
              </Box>

              <IconButton
                aria-label="menu"
                sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Spacer to offset fixed AppBar — matches contact bar + toolbar height */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, height: 105 }} />
      <Toolbar />

      <Drawer
        anchor={isRTL ? 'left' : 'right'}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* QR code enlarge dialog */}
      <Dialog
        open={qrDialog.open}
        onClose={() => setQrDialog({ open: false, src: '', title: '' })}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            {qrDialog.title} QR Code
          </Typography>
          <Box
            component="img"
            src={qrDialog.src}
            alt={`${qrDialog.title} QR Code`}
            sx={{ width: 240, height: 240, borderRadius: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {qrDialog.title === 'WeChat' ? t('contact.scan') : 'Scan to chat on WhatsApp'}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Navbar;
