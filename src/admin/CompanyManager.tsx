/**
 * Company info management page — form for editing company details.
 *
 * Edits company name, about section title, descriptions (all 5 languages),
 * statistics, and advantage card titles/descriptions (5 languages).
 * Changes are saved to KV via async API calls and immediately reflected on the site.
 */

import { useState, type FormEvent, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Grid,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PublicIcon from '@mui/icons-material/Public';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAdminData } from './AdminDataContext';
import type { CompanyInfo } from './adminStorage';
import LocalizedTextField from './LocalizedTextField';

/**
 * Company info editor form with async save button.
 */
function CompanyManager(): JSX.Element {
  const { companyInfo, updateCompanyInfo } = useAdminData();
  const [formData, setFormData] = useState<CompanyInfo>({
    ...companyInfo,
    stats: { ...companyInfo.stats },
    advantages: {
      oem: { ...companyInfo.advantages.oem },
      shipping: { ...companyInfo.advantages.shipping },
      price: { ...companyInfo.advantages.price },
      exportAdv: { ...companyInfo.advantages.exportAdv },
    },
  });
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  /** Updates a localized top-level field. */
  const handleLocalizedChange = (field: 'name' | 'title' | 'description1' | 'description2') => (
    value: typeof formData.name,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  /** Updates a stat value. */
  const handleStatChange = (statKey: keyof CompanyInfo['stats']) => (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      stats: { ...prev.stats, [statKey]: event.target.value },
    }));
    setSaved(false);
  };

  /** Updates a localized advantage field. */
  const handleAdvantageChange = (
    advKey: keyof CompanyInfo['advantages'],
    field: 'title' | 'desc',
    value: typeof formData.name,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      advantages: {
        ...prev.advantages,
        [advKey]: { ...prev.advantages[advKey], [field]: value },
      },
    }));
    setSaved(false);
  };

  /** Saves the company info. */
  const handleSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateCompanyInfo(formData);
      setSaved(true);
      setSnackbar({ open: true, message: '公司信息保存成功！', severity: 'success' });
    } catch (err: any) {
      setError('保存失败: ' + (err.message || '未知错误'));
      setSnackbar({ open: true, message: '保存失败: ' + (err.message || '未知错误'), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /** Stat input configuration. */
  const statFields: { key: keyof CompanyInfo['stats']; label: string }[] = [
    { key: 'stat1', label: '年出口量' },
    { key: 'stat2', label: '服务国家数' },
    { key: 'stat3', label: '产品类型' },
    { key: 'stat4', label: '活跃客户' },
  ];

  /** Advantage section configuration. */
  const advantageSections: {
    key: keyof CompanyInfo['advantages'];
    label: string;
    icon: JSX.Element;
  }[] = [
    { key: 'oem', label: 'OEM品质', icon: <VerifiedIcon color="secondary" /> },
    { key: 'shipping', label: '快速发货', icon: <LocalShippingIcon color="secondary" /> },
    { key: 'price', label: '价格优势', icon: <AttachMoneyIcon color="secondary" /> },
    { key: 'exportAdv', label: '全球出口', icon: <PublicIcon color="secondary" /> },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
        公司信息
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        编辑公司名称、描述、统计数据和优势卡片。所有文本支持5种语言。
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
        <form onSubmit={handleSave}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {saved && (
            <Alert severity="success" sx={{ mb: 3 }}>
              公司信息保存成功！
            </Alert>
          )}

          {/* Company name and title */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            公司名称和标题
          </Typography>
          <LocalizedTextField
            label="公司名称"
            value={formData.name}
            onChange={handleLocalizedChange('name')}
          />
          <LocalizedTextField
            label="关于我们标题"
            value={formData.title}
            onChange={handleLocalizedChange('title')}
          />

          <Divider sx={{ my: 3 }} />

          {/* Descriptions */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            公司描述
          </Typography>
          <LocalizedTextField
            label="描述（第一段）"
            multiline
            rows={4}
            value={formData.description1}
            onChange={handleLocalizedChange('description1')}
          />
          <LocalizedTextField
            label="描述（第二段）"
            multiline
            rows={4}
            value={formData.description2}
            onChange={handleLocalizedChange('description2')}
          />

          <Divider sx={{ my: 3 }} />

          {/* Statistics */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="secondary" /> 统计数据
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statFields.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.key}>
                <TextField
                  fullWidth
                  label={stat.label}
                  value={formData.stats[stat.key]}
                  onChange={handleStatChange(stat.key)}
                  size="small"
                  disabled={saving}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Advantages */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            优势卡片
          </Typography>
          {advantageSections.map((section, index) => (
            <Box key={section.key}>
              {index > 0 && <Divider sx={{ my: 3 }} />}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                {section.icon} {section.label}
              </Typography>
              <LocalizedTextField
                label="标题"
                value={formData.advantages[section.key].title}
                onChange={(value) => handleAdvantageChange(section.key, 'title', value)}
              />
              <LocalizedTextField
                label="描述"
                multiline
                rows={2}
                value={formData.advantages[section.key].desc}
                onChange={(value) => handleAdvantageChange(section.key, 'desc', value)}
              />
            </Box>
          ))}

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
              {saving ? '保存中...' : '保存修改'}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default CompanyManager;
