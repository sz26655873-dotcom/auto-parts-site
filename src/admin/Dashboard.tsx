/**
 * Admin dashboard — overview of site data and quick navigation.
 *
 * Displays summary cards (product count, current language, contact status),
 * quick-link buttons to each management page, and data export/import shortcuts.
 * All data operations are now async (calling KV API).
 */

import { useRef, useState, type ChangeEvent } from 'react';
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
  CircularProgress,
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
  const { products, contactInfo, companyInfo, lastModified, exportAllData, importAllData, loading } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);

  /** Triggers a JSON file download of all admin data. */
  const handleExport = async (): Promise<void> => {
    setExportLoading(true);
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autoparts-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('导出失败: ' + (err.message || '未知错误'));
    } finally {
      setExportLoading(false);
    }
  };

  /** Handles JSON file import. */
  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    const reader = new FileReader();
    reader.onload = async (e): Promise<void> => {
      const text = e.target?.result as string;
      try {
        const success = await importAllData(text);
        if (success) {
          alert('数据导入成功！');
        } else {
          alert('数据导入失败，请检查文件格式。');
        }
      } catch (err: any) {
        alert('导入失败: ' + (err.message || '未知错误'));
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  /** Summary card data. */
  const summaryCards = [
    {
      label: '产品总数',
      value: String(products.length),
      icon: <InventoryIcon />,
      color: 'primary.main',
    },
    {
      label: '当前语言',
      value: languageNames[lang],
      icon: <LanguageIcon />,
      color: 'secondary.main',
    },
    {
      label: 'WhatsApp号码',
      value: contactInfo.whatsapp || '未设置',
      icon: <ContactPhoneIcon />,
      color: 'primary.light',
    },
    {
      label: '公司名称',
      value: companyInfo.name[lang] || '未设置',
      icon: <BusinessIcon />,
      color: 'secondary.light',
    },
  ];

  /** Quick navigation buttons. */
  const quickLinks = [
    { label: '管理产品', path: '/admin/products', icon: <InventoryIcon /> },
    { label: '编辑联系方式', path: '/admin/contact', icon: <ContactPhoneIcon /> },
    { label: '编辑公司信息', path: '/admin/company', icon: <BusinessIcon /> },
    { label: '数据管理', path: '/admin/data', icon: <StorageIcon /> },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
        控制台
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        欢迎使用 Altai Auto Parts 管理后台。在这里管理您的产品、联系方式和公司信息。
      </Typography>

      {/* Last modified info */}
      {lastModified && (
        <Alert severity="info" sx={{ mb: 3 }}>
          数据最后修改时间：{new Date(lastModified).toLocaleString()}
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
        快捷操作
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
        数据备份
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={exportLoading}
        >
          {exportLoading ? '导出中...' : '导出数据 (JSON)'}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={importLoading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
          onClick={handleImportClick}
          disabled={importLoading}
        >
          {importLoading ? '导入中...' : '导入数据 (JSON)'}
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
