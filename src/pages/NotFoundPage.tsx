/**
 * NotFoundPage — 404 page for unmatched routes.
 *
 * Displays a friendly 404 message with navigation buttons to
 * return home or browse the product catalog.
 */

import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import { useLanguage } from '../i18n/LanguageContext';
import Seo from '../components/seo/Seo';

/**
 * Renders the 404 not found page with SEO meta tags.
 */
function NotFoundPage(): JSX.Element {
  const { t } = useLanguage();

  return (
    <>
      <Seo
        title={t('notfound.title')}
        description={t('notfound.desc')}
        canonical="/404"
      />

      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 10, md: 16 },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '5rem', md: '8rem' },
              fontWeight: 900,
              color: 'primary.main',
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            {t('notfound.title')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
          >
            {t('notfound.desc')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/"
              startIcon={<HomeIcon />}
              sx={{ textTransform: 'none', px: 4 }}
            >
              {t('notfound.backHome')}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={Link}
              to="/products"
              startIcon={<CategoryIcon />}
              sx={{ textTransform: 'none', px: 4 }}
            >
              {t('notfound.browseProducts')}
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default NotFoundPage;
