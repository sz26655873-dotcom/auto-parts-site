import { useState, type FormEvent, type ChangeEvent } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import { buildWhatsAppLinkForLang } from '../utils/whatsapp';
import WeChatDialog from './WeChatDialog';

/** Contact info items with icon, label key, and value. */
interface ContactInfoItem {
  icon: JSX.Element;
  labelKey: string;
  value: string;
}

/**
 * Contact section — WhatsApp button, WeChat QR dialog trigger,
 * contact details, and a simple inquiry form.
 */
function Contact(): JSX.Element {
  const { t, lang } = useLanguage();
  const { contactInfo } = useAdminData();
  const [wechatOpen, setWechatOpen] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  /** Contact info items built from the admin-managed contact data. */
  const contactItems: ContactInfoItem[] = [
    {
      icon: <EmailIcon />,
      labelKey: 'contact.email',
      value: contactInfo.email,
    },
    {
      icon: <PhoneIcon />,
      labelKey: 'contact.phone',
      value: contactInfo.phone,
    },
    {
      icon: <LocationOnIcon />,
      labelKey: 'contact.address',
      value: contactInfo.address[lang],
    },
  ];

  const handleInputChange = (field: keyof typeof formData) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    // In production this would POST to a backend API.
    setFormSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: '#0A2342',
        color: '#fff',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: 'secondary.light', fontWeight: 700, letterSpacing: 2 }}
          >
            {t('contact.badge')}
          </Typography>
          <Typography variant="h2" sx={{ mt: 1, color: '#fff' }}>
            {t('contact.title')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left: Contact buttons + info */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href={buildWhatsAppLinkForLang(lang, contactInfo.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.05rem',
                  boxShadow: '0 4px 20px rgba(255,107,0,0.4)',
                }}
              >
                {t('contact.whatsappBtn')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setWechatOpen(true)}
                startIcon={<QrCodeIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.05rem',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.4)',
                  '&:hover': {
                    borderColor: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {t('contact.wechatBtn')}
              </Button>
            </Stack>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', my: 3 }} />

            <Stack spacing={2}>
              {contactItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'secondary.light',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}
                    >
                      {t(item.labelKey)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#fff' }}>
                      {item.value || t('contact.addressValue')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Right: Inquiry form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                backgroundColor: '#fff',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                {t('contact.formTitle')}
              </Typography>

              {formSubmitted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {t('contact.formSuccess')}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  required
                  label={t('contact.formName')}
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  required
                  type="email"
                  label={t('contact.formEmail')}
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label={t('contact.formMessage')}
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  margin="normal"
                  variant="outlined"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 2, py: 1.5 }}
                >
                  {t('contact.formSubmit')}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <WeChatDialog open={wechatOpen} onClose={() => setWechatOpen(false)} />
    </Box>
  );
}

export default Contact;
