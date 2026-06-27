/**
 * ContactPage — contact page at /contact.
 *
 * Wraps the existing <Contact> component with SEO meta tags
 * and breadcrumbs.
 */

import { Container } from '@mui/material';
import { useLanguage } from '../i18n/LanguageContext';
import Seo from '../components/seo/Seo';
import Breadcrumb from '../components/Breadcrumb';
import Contact from '../components/Contact';

/**
 * Renders the contact page with SEO and breadcrumbs.
 */
function ContactPage(): JSX.Element {
  const { t } = useLanguage();

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/' },
    { label: t('breadcrumb.contact'), href: '/contact' },
  ];

  return (
    <>
      <Seo
        title="Contact Altai Auto Parts — Get a Quote"
        description="Contact Altai Auto Parts for OEM auto parts quotes. WhatsApp, WeChat, email — we respond within 24 hours."
        canonical="/contact"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />
      </Container>

      <Contact />
    </>
  );
}

export default ContactPage;
