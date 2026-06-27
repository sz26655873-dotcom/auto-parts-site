import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import { buildWhatsAppLinkForLang } from '../utils/whatsapp';

interface WhatsAppDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog displaying a WhatsApp QR code image and a direct chat link.
 * Triggered from the Contact section's WhatsApp QR button.
 */
function WhatsAppDialog({ open, onClose }: WhatsAppDialogProps): JSX.Element {
  const { t, lang } = useLanguage();
  const { contactInfo } = useAdminData();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 700,
          textAlign: 'center',
          pb: 1,
          pr: 6,
        }}
      >
        {t('whatsapp.title')}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('whatsapp.scan')}
        </Typography>
        <Box
          component="img"
          src={contactInfo.whatsappQrImage}
          alt="WhatsApp QR Code"
          sx={{
            width: 240,
            height: 240,
            borderRadius: 2,
            border: '2px solid #E2E8F0',
          }}
        />
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          href={buildWhatsAppLinkForLang(lang, contactInfo.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<WhatsAppIcon />}
          sx={{ mt: 2, py: 1.2 }}
        >
          {t('whatsapp.chat')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default WhatsAppDialog;
