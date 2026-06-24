/**
 * Contact info management page — form for editing contact details.
 *
 * Edits WhatsApp number, email, phone, address (5 languages), WeChat ID,
 * and WeChat QR image URL. Changes are saved to localStorage via the
 * AdminDataContext and immediately reflected on the front-end site.
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
  Avatar,
  Divider,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useAdminData } from './AdminDataContext';
import type { ContactInfo } from './adminStorage';
import LocalizedTextField from './LocalizedTextField';

/**
 * Contact info editor form with save button.
 */
function ContactManager(): JSX.Element {
  const { contactInfo, updateContactInfo } = useAdminData();
  const [formData, setFormData] = useState<ContactInfo>({ ...contactInfo });
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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
  const handleSave = (event: FormEvent): void => {
    event.preventDefault();

    if (!formData.whatsapp.trim()) {
      setError('WhatsApp number is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required.');
      return;
    }

    updateContactInfo(formData);
    setSaved(true);
    setError('');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
        Contact Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Edit the contact details displayed on the front-end site. Changes take effect immediately after saving.
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
              Contact information saved successfully!
            </Alert>
          )}

          {/* WhatsApp */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsAppIcon color="secondary" /> WhatsApp
          </Typography>
          <TextField
            fullWidth
            label="WhatsApp Number"
            required
            value={formData.whatsapp}
            onChange={handleScalarChange('whatsapp')}
            size="small"
            sx={{ mb: 3 }}
            helperText="International format without + (e.g. 8613800138000)"
          />

          <Divider sx={{ my: 3 }} />

          {/* Email & Phone */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="primary" /> Email & Phone
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email"
              required
              type="email"
              value={formData.email}
              onChange={handleScalarChange('email')}
              size="small"
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={handleScalarChange('phone')}
              size="small"
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Address (localized) */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Address (5 languages)
          </Typography>
          <LocalizedTextField
            label="Company Address"
            value={formData.address}
            onChange={handleAddressChange}
          />

          <Divider sx={{ my: 3 }} />

          {/* WeChat */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon color="primary" /> WeChat
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="WeChat ID"
              value={formData.wechatId}
              onChange={handleScalarChange('wechatId')}
              size="small"
            />
            <TextField
              fullWidth
              label="WeChat QR Image URL"
              value={formData.wechatQrImage}
              onChange={handleScalarChange('wechatQrImage')}
              size="small"
              helperText="Square image URL for QR code"
            />
          </Stack>
          {formData.wechatQrImage && (
            <Avatar
              src={formData.wechatQrImage}
              alt="QR Preview"
              variant="rounded"
              sx={{ width: 100, height: 100, mt: 1 }}
            />
          )}

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary" size="large">
              Save Changes
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default ContactManager;
