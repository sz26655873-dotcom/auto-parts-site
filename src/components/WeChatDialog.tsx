import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';

interface WeChatDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog displaying a WeChat QR code (placeholder image) and WeChat ID.
 * Triggered from the Contact section's "Add WeChat" button.
 */
function WeChatDialog({ open, onClose }: WeChatDialogProps): JSX.Element {
  const { t } = useLanguage();
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
        {t('wechat.title')}
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
          {t('wechat.scan')}
        </Typography>
        <Box
          component="img"
          src={contactInfo.wechatQrImage}
          alt="WeChat QR Code"
          sx={{
            width: 240,
            height: 240,
            borderRadius: 2,
            border: '2px solid #E2E8F0',
          }}
        />
        <Box
          sx={{
            mt: 2,
            display: 'inline-block',
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#15803D' }}>
            {t('wechat.id')}: {contactInfo.wechatId}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default WeChatDialog;
