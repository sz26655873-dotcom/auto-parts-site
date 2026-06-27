/**
 * Contact info management page — form for editing contact details.
 *
 * Edits WhatsApp number, email, phone, address (5 languages), WeChat ID,
 * and WeChat QR image URL. Changes are saved to KV via async API calls
 * through AdminDataContext and immediately reflected on the front-end site.
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
  CircularProgress,
  Snackbar,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useAdminData } from './AdminDataContext';
import type { ContactInfo } from './adminStorage';
import LocalizedTextField from './LocalizedTextField';
import ImageUpload from './ImageUpload';

/**
 * Contact info editor form with async save button.
 */
function ContactManager(): JSX.Element {
  const { contactInfo, updateContactInfo } = useAdminData();
  const [formData, setFormData] = useState<ContactInfo>({ ...contactInfo });
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  /** Updates a scalar field on the form data. */
  const handleScalarChange = (field: keyof ContactInfo) => (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setSaved(false);
  };

  /** Updates the localized address field. */
  const handleAddressChange = (address: typeof formData.address): void => {
    setFormData((prev) => ({ ...prev, address }));
    setSaved(false);
  };

  /** Validates and saves the contact info. */
  const handleSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (!formData.whatsapp.trim()) {
      setError('请填写 WhatsApp 号码。');
      return;
    }
    if (!formData.email.trim()) {
      setError('请填写邮箱。');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateContactInfo(formData);
      setSaved(true);
      setSnackbar({ open: true, message: '联系方式保存成功！', severity: 'success' });
    } catch (err: any) {
      setError('保存失败: ' + (err.message || '未知错误'));
      setSnackbar({ open: true, message: '保存失败: ' + (err.message || '未知错误'), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
        联系方式
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        编辑前台网站显示的联系方式。保存后立即生效。
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
        <form onSubmit={handleSave}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {saved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              联系方式保存成功！
            </Alert>
          )}

          {/* WhatsApp */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsAppIcon color="secondary" /> WhatsApp
          </Typography>
          <TextField
            fullWidth
            label="WhatsApp 号码"
            required
            value={formData.whatsapp}
            onChange={handleScalarChange('whatsapp')}
            size="small"
            sx={{ mb: 3 }}
            helperText="国际格式，不含+号（如 8615711970362)"
            disabled={saving}
          />
          <ImageUpload
            value={formData.whatsappQrImage}
            onChange={(url) => {
              setFormData((prev) => ({ ...prev, whatsappQrImage: url }));
              setSaved(false);
            }}
            label="WhatsApp 二维码图片"
          />

          <Divider sx={{ my: 3 }} />

          {/* Email & Phone */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="primary" /> 邮箱和电话
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="邮箱"
              required
              type="email"
              value={formData.email}
              onChange={handleScalarChange('email')}
              size="small"
              disabled={saving}
            />
            <TextField
              fullWidth
              label="电话"
              value={formData.phone}
              onChange={handleScalarChange('phone')}
              size="small"
              disabled={saving}
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Address (localized) */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            地址（5种语言）
          </Typography>
          <LocalizedTextField
            label="公司地址"
            value={formData.address}
            onChange={handleAddressChange}
          />

          <Divider sx={{ my: 3 }} />

          {/* WeChat */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon color="primary" /> 微信
          </Typography>
          <TextField
            fullWidth
            label="微信号"
            value={formData.wechatId}
            onChange={handleScalarChange('wechatId')}
            size="small"
            sx={{ mb: 2 }}
            disabled={saving}
          />
          <ImageUpload
            value={formData.wechatQrImage}
            onChange={(url) => {
              setFormData((prev) => ({ ...prev, wechatQrImage: url }));
              setSaved(false);
            }}
            label="微信二维码图片"
          />

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

export default ContactManager;
