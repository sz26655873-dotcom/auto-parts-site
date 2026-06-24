import { Box, Container, Typography, Grid, Stack, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useLanguage } from '../i18n/LanguageContext';

/** Quick navigation links for the footer. */
const footerLinks = [
  { key: 'nav.home', href: '#home' },
  { key: 'nav.products', href: '#products' },
  { key: 'nav.about', href: '#about' },
  { key: 'nav.contact', href: '#contact' },
];

/** Social media platforms with icons and placeholder links. */
const socialLinks = [
  { icon: <FacebookIcon />, href: '#', label: 'Facebook' },
  { icon: <TwitterIcon />, href: '#', label: 'Twitter' },
  { icon: <LinkedInIcon />, href: '#', label: 'LinkedIn' },
  { icon: <YouTubeIcon />, href: '#', label: 'YouTube' },
];

/** Current year for copyright notice. */
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Footer — brand description, quick links, social media icons,
 * and copyright notice.
 */
function Footer(): JSX.Element {
  const { t } = useLanguage();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#061629',
        color: '#fff',
        py: 6,
        borderTop: '3px solid',
        borderColor: 'secondary.main',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand column */}
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <DirectionsCarIcon sx={{ color: 'secondary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Altai Auto
                <Box component="span" sx={{ color: 'secondary.main' }}>
                  Parts
                </Box>
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 380, lineHeight: 1.7 }}
            >
              {t('footer.desc')}
            </Typography>
          </Grid>

          {/* Quick links column */}
          <Grid item xs={6} md={3}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}
            >
              {t('footer.quickLinks')}
            </Typography>
            <Stack spacing={1}>
              {footerLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  underline="hover"
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'secondary.light' },
                  }}
                >
                  {t(link.key)}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Social links column */}
          <Grid item xs={6} md={4}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}
            >
              {t('footer.followUs')}
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      color: 'secondary.main',
                      borderColor: 'secondary.main',
                      backgroundColor: 'rgba(255,107,0,0.1)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 5,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © {CURRENT_YEAR} Altai Auto Parts. {t('footer.rights')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
