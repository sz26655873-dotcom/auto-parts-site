/**
 * HomePage — landing page at /.
 *
 * Combines the Hero section, brand catalog (logo + name strip),
 * featured products grid, company advantages, and a CTA section.
 * Uses the isHome SEO flag so the full title is used without the
 * site name suffix.
 */

import { useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import { type Product } from '../data/products';
import Seo from '../components/seo/Seo';
import Hero from '../components/Hero';
import Advantages from '../components/Advantages';
import Contact from '../components/Contact';
import ProductCard from '../components/ProductCard';
import { productCategories } from '../data/products';
import { useTrackView } from '../hooks/useTrackView';

/**
 * Renders the homepage with all major sections.
 */
function HomePage(): JSX.Element {
  const { t, lang } = useLanguage();
  const { products } = useAdminData();
  useTrackView('page', 'home');

  // Brand categories (excluding "all")
  const brands = productCategories.filter((c) => c.id !== 'all');

  // Featured / fallback products for the grid
  const displayProducts: Product[] = useMemo(() => {
    const featured = products
      .filter((p) => p.featured === true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
      .slice(0, 8);
    return featured.length > 0
      ? featured
      : [...products]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
          .slice(0, 8);
  }, [products]);

  return (
    <>
      <Seo
        title="Altai Auto Parts - B2B Auto Parts Export & Manufacturing"
        description="Leading exporter of premium OEM auto parts. Engine parts, brake systems, suspension, electrical, body parts and filters. Competitive pricing, global shipping to 60+ countries."
        canonical="/"
        isHome
      />

      {/* Brand catalog + products — merged section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          {/* Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2">
              {t('products.title')}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}
            >
              {t('products.subtitle')}
            </Typography>
          </Box>

          {/* Brand logo + name strip */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 5,
            }}
          >
            {brands.map((brand) => (
              <Paper
                key={brand.id}
                component={Link}
                to={`/products/category/${brand.id}`}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                  py: 1.5,
                  borderRadius: '50px',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  color: 'text.primary',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    boxShadow: '0 4px 12px rgba(255,107,0,0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={brand.label[lang]}
                    style={{
                      width: 28,
                      height: 28,
                      objectFit: 'contain',
                    }}
                  />
                )}
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, lineHeight: 1 }}
                >
                  {brand.label[lang]}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* Product cards grid */}
          {displayProducts.length > 0 && (
            <Grid container spacing={3}>
              {displayProducts.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <ProductCard product={product} compact />
                </Grid>
              ))}
            </Grid>
          )}

          {/* View All button */}
          {displayProducts.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/products"
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none', px: 4 }}
              >
                {t('products.viewAll')}
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Advantages */}
      <Advantages />

      {/* Hero carousel */}
      <Hero />

      {/* Contact section */}
      <Contact />
    </>
  );
}

export default HomePage;
