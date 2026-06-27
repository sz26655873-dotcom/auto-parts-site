import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Fab,
  TextField,
  Button,
  Alert,
  IconButton,
  Box,
  Typography,
  Link,
  keyframes,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLinkForLang } from '../utils/whatsapp';

/** Pulse animation to draw attention to the floating button. */
const pulse = keyframes`
  0%, 100% { box-shadow: 0 4px 20px rgba(255,107,0,0.4); }
  50% { box-shadow: 0 4px 30px rgba(255,107,0,0.7); }
`;

/** Slide-up entrance for the floating panel. */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/**
 * Floating inquiry button fixed at the bottom-right corner.
 * Opens a dialog with a quick inquiry form (name, phone, email, message).
 * Submits to the same /api/inquiry endpoint as the Contact section form.
 * Only renders on frontend pages (hidden on /admin routes).
 */
function FloatingInquiry(): JSX.Element | null {
  const { t, isRTL, lang } = useLanguage();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Auto-open on desktop only, with a 10-15 second delay for first visit.
  // On mobile, user must tap the FAB to open (no auto-open).
  const [open, setOpen] = useState<boolean>(false);
  const autoOpenedRef = useRef<boolean>(false);
  const prefillRef = useRef<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formError, setFormError] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  // Hide on /contact and /admin routes
  const shouldHide = location.pathname === '/contact' || location.pathname.startsWith('/admin');
  if (shouldHide) return null;

  // Desktop: auto-open after 12 seconds delay (first visit only)
  useEffect(() => {
    if (!isMobile && !autoOpenedRef.current) {
      const timer = setTimeout(() => {
        setOpen(true);
        autoOpenedRef.current = true;
      }, 12000); // 12-second delay
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Listen for custom event from AiChatWidget to open inquiry form with pre-filled message
  useEffect(() => {
    const handleOpenFromChat = (): void => {
      const chatMessage = sessionStorage.getItem('aiChatInquiryMessage') || '';
      prefillRef.current = chatMessage;
      setOpen(true);
      if (chatMessage) {
        setFormData((prev) => ({ ...prev, message: chatMessage }));
        sessionStorage.removeItem('aiChatInquiryMessage');
      }
    };

    window.addEventListener('openInquiryFromChat', handleOpenFromChat);
    return () => window.removeEventListener('openInquiryFromChat', handleOpenFromChat);
  }, []);

  const handleInputChange = (field: keyof typeof formData) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(false);
    setFormSubmitted(false);

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setFormSubmitted(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
      // Auto-close dialog after 2.5 seconds on success
      setTimeout(() => {
        setOpen(false);
        setFormSubmitted(false);
      }, 2500);
    } catch {
      setFormError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpen = (): void => {
    setFormSubmitted(false);
    setFormError(false);
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <>
      {/* Floating button — right corner for LTR, left corner for RTL */}
      <Fab
        variant="extended"
        color="secondary"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 24,
          [isRTL ? 'left' : 'right']: 24,
          zIndex: 1300,
          px: 2.5,
          py: 1.5,
          fontWeight: 700,
          fontSize: '0.95rem',
          textTransform: 'none',
          animation: `${pulse} 2s ease-in-out infinite`,
          '&:hover': {
            animation: 'none',
            transform: 'scale(1.05)',
          },
          transition: 'transform 0.2s ease',
        }}
      >
        <EmailIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0 }} />
        {t('contact.quickInquiry')}
      </Fab>

      {/* Floating inquiry panel — chat-style floating window */}
      <Box
        sx={{
          position: 'fixed',
          [isRTL ? 'left' : 'right']: 20,
          bottom: 80,
          zIndex: 1400,
          display: open ? 'block' : 'none',
        }}
      >
        <Box
          sx={{
            width: { xs: 'calc(100vw - 40px)', sm: '380px' },
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            animation: `${slideUp} 0.25s ease-out`,
            fontFamily: (theme) => theme.typography.fontFamily,
          }}
        >
          {/* Header bar — draggable look */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
              color: '#fff',
              px: 2.5,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {t('contact.formTitle')}
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#fff' } }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Form content */}
          <Box sx={{ p: 2.5, maxHeight: '55vh', overflowY: 'auto' }}>
            {formSubmitted && (
              <Alert severity="success" sx={{ mb: 1.5 }}>
                {t('contact.formSuccess')}
              </Alert>
            )}
            {formError && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {t('contact.formError')}
              </Alert>
            )}

            {!formSubmitted && (
              <Box component="form" onSubmit={handleSubmit} id="floating-inquiry-form">
                <TextField
                  fullWidth
                  required
                  label={t('contact.formName')}
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  margin="dense"
                  variant="outlined"
                  size="small"
                  disabled={submitting}
                  autoFocus
                  sx={{ mb: 0.5 }}
                />
                <TextField
                  fullWidth
                  required
                  label={t('contact.formPhone')}
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  margin="dense"
                  variant="outlined"
                  size="small"
                  disabled={submitting}
                  sx={{ mb: 0.5 }}
                />
                <TextField
                  fullWidth
                  required
                  type="email"
                  label={t('contact.formEmail')}
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="dense"
                  variant="outlined"
                  size="small"
                  disabled={submitting}
                  sx={{ mb: 0.5 }}
                />
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={3}
                  label={t('contact.formMessage')}
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  margin="dense"
                  variant="outlined"
                  size="small"
                  disabled={submitting}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button onClick={handleClose} disabled={submitting} size="small">
                    {t('contact.formCancel')}
                  </Button>
                  <Button
                    type="submit"
                    form="floating-inquiry-form"
                    variant="contained"
                    size="small"
                    disabled={submitting}
                    sx={{
                      background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0d1642 0%, #1a237e 100%)',
                      },
                    }}
                  >
                    {submitting ? t('contact.formSending') : t('contact.formSubmit')}
                  </Button>
                </Box>

                {/* WhatsApp shortcut — below the submit buttons */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>
                    {t('aiChat.preferWhatsapp')}{' '}
                    <Link
                      href={buildWhatsAppLinkForLang(lang)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.3,
                        color: '#25d366',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      <WhatsAppIcon sx={{ fontSize: 14 }} />
                      {t('aiChat.clickToChat')}
                    </Link>
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default FloatingInquiry;
