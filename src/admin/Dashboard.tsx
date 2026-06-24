/**
 * Admin dashboard — overview of site data and quick navigation.
 *
 * Displays summary cards (product count, current language, contact status),
 * quick-link buttons to each management page, and data export/import shortcuts.
 */

import { useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LanguageIcon from '@mui/icons-material/Language';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import BusinessIcon from '@mui/icons-material/Business';
import StorageIcon from '@mui/icons-material/Storage';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from './AdminDataContext';
import { languageNames } from '../i18n/translations';

/**
 * Dashboard with overview statistics and navigation shortcuts.
 */
function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { products, contactInfo, companyInfo, lastModified, exportAllData, importAllData } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Triggers a JSON file download of all admin data. */
  const handleExport = (): void => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoparts-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /** Handles JSON file import. */
  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e): void => {
      const text = e.target?.result as string;
      const success = importAllData(text);
      if (success) {
        alert('Data imported successfully!');
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected.
    event.target.value = '';
  };

  /** Summary card data. */
  const summaryCards = [
    {
      label: 'Total Products',
      value: String(products.length),
      icon: <InventoryIcon />,
      color: 'primary.main',
    },
    {
      label: 'Current Language',
      value: languageNames[lang],
      icon: <LanguageIcon />,
      color: 'secondary.main',
    },
    {
      label: 'WhatsApp Number',
      value: contactInfo.whatsapp || 'Not set',
      icon: <ContactPhoneIcon />,
      color: 'primary.light',
    },
    {
      label: 'Company Name',
      value: companyInfo.name[lang] || 'Not set',
      icon: <BusinessIcon />,
      color: 'secondary.light',
    },
  ];

  /** Quick navigation buttons. */
  const quickLinks = [
    { label: 'Manage Products', path: '/admin/products', icon: <InventoryIcon /> },
    { label: 'Edit Contact Info', path: '/admin/contact', icon: <ContactPhoneIcon /> },
    { label: 'Edit Company Info', path: '/admin/company', icon: <BusinessIcon /> },
    { label: 'Data Management', path: '/admin/data', icon: <StorageIcon /> },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to the AutoParts Export admin panel. Manage your products, contact details, and company information.
      </Typography>

      {/* Last modified info */}
      {lastModified && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Data last modified: {new Date(lastModified).toLocaleString()}
        </Alert>
      )}

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: card.color,
                    color: '#fff',
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Quick navigation */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickLinks.map((link) => (
          <Grid item xs={12} sm={6} md={3} key={link.path}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'secondary.main',
                  boxShadow: '0 8px 25px rgba(255,107,0,0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => navigate(link.path)}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: 'primary.light',
                      color: '#fff',
                    }}
                  >
                    {link.icon}
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                    {link.label}
                  </Typography>
                  <ArrowForwardIcon color="action" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Data export/import shortcuts */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Data Backup
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Data (JSON)
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={handleImportClick}
        >
          Import Data (JSON)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Stack>
    </Box>
  );
}

export default Dashboard;
