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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TranslateIcon from '@mui/icons-material/Translate';
import { useLanguage } from '../i18n/LanguageContext';
import {
  languageNames,
  type Language,
} from '../i18n/translations';

/** All supported languages for the dropdown selector. */
const supportedLanguages: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];

/** Navigation menu items with anchor links and i18n keys. */
const navItems = [
  { key: 'nav.home', href: '#home' },
  { key: 'nav.products', href: '#products' },
  { key: 'nav.about', href: '#about' },
  { key: 'nav.contact', href: '#contact' },
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
 * Fixed top navigation bar with logo, menu links, and language selector.
 * Collapses to a hamburger drawer on mobile.
 * Drawer anchor adapts to RTL/LTR direction automatically.
 */
function Navbar(): JSX.Element {
  const { t, isRTL } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const handleDrawerToggle = (): void => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle} role="presentation">
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton component="a" href={item.href}>
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
      <AppBar position="fixed" color="primary" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <DirectionsCarIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography
              variant="h6"
              component="a"
              href="#home"
              sx={{
                mr: 4,
                fontWeight: 800,
                color: 'inherit',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
                whiteSpace: 'nowrap',
              }}
            >
              AutoParts
              <Box component="span" sx={{ color: 'secondary.main' }}>
                Export
              </Box>
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  href={item.href}
                  sx={{ color: '#fff', fontWeight: 500, minWidth: 'auto' }}
                >
                  {t(item.key)}
                </Button>
              ))}
            </Box>

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

      {/* Spacer to offset fixed AppBar */}
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
    </>
  );
}

export default Navbar;
