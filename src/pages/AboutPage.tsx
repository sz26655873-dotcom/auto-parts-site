/**
 * AboutPage — about us page at /about.
 *
 * Wraps the existing <About> component with SEO meta tags,
 * breadcrumbs, and a bottom CTA section.
 */

import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import Seo from '../components/seo/Seo';
import Breadcrumb from '../components/Breadcrumb';
import About from '../components/About';

/**
 * Renders the about page with SEO and breadcrumbs.
 */
function AboutPage(): JSX.Element {
  const { t } = useLanguage();

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/' },
    { label: t('breadcrumb.about'), href: '/about' },
  ];

  return (
    <>
      <Seo
        title="About Altai Auto Parts — 15 Years of Excellence"
        description="Altai Auto Parts — 15 years of OEM auto parts manufacturing and export. Quality guaranteed, shipping to 60+ countries."
        canonical="/about"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />
      </Container>

      <About />

      {/* CTA section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          backgroundColor: 'primary.main',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
            {t('contact.title')}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            to="/contact"
            sx={{ textTransform: 'none', px: 4 }}
          >
            {t('hero.ctaContact')}
          </Button>
        </Container>
      </Box>
    </>
  );
}

export default AboutPage;
