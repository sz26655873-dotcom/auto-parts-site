import { Box, Container, Typography, Button, Stack } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ChatIcon from '@mui/icons-material/Chat';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import { buildWhatsAppLinkForLang } from '../utils/whatsapp';

/**
 * Hero section — large headline, subtitle, and dual CTA buttons
 * (WhatsApp quote + WeChat add). Industrial navy background with accent.
 */
function Hero(): JSX.Element {
  const { t, lang } = useLanguage();
  const { contactInfo } = useAdminData();

  return (
    <Box
      id="home"
      sx={{
        position: 'relative',
        minHeight: { xs: '85vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, #0A2342 0%, #061629 60%, #030B15 100%)',
        overflow: 'hidden',
        pt: { xs: 10, md: 8 },
        pb: { xs: 8, md: 10 },
      }}
    >
      {/* Decorative grid pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      {/* Accent glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          right: '-5%',
          width: '40%',
          height: '60%',
          background:
            'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 720 }}>
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.75,
              mb: 3,
              border: '1px solid rgba(255,107,0,0.5)',
              borderRadius: 50,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.light',
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.7rem',
              }}
            >
              {t('hero.badge')}
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              color: '#fff',
              mb: 3,
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
              lineHeight: 1.15,
            }}
          >
            {t('hero.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.75)',
              mb: 5,
              fontSize: { xs: '1rem', md: '1.15rem' },
              maxWidth: 600,
              lineHeight: 1.7,
            }}
          >
            {t('hero.subtitle')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              href={buildWhatsAppLinkForLang(lang, contactInfo.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<WhatsAppIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                boxShadow: '0 4px 20px rgba(255,107,0,0.4)',
              }}
            >
              {t('hero.ctaWhatsapp')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="#contact"
              startIcon={<ChatIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {t('hero.ctaWechat')}
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Hero;
