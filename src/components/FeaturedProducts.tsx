/**
 * FeaturedProducts — homepage section showcasing featured products.
 *
 * Filters products with featured === true, takes the top 8, and
 * renders them in a compact card grid. Includes a "View All Products"
 * link to the full catalog.
 */

import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import { type Product } from '../data/products';
import ProductCard from './ProductCard';

/**
 * Renders the featured products section for the homepage.
 */
function FeaturedProducts(): JSX.Element {
  const { t } = useLanguage();
  const { products } = useAdminData();

  const featuredProducts: Product[] = products
    .filter((p) => p.featured === true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
    .slice(0, 8);

  // Fallback: if no products have the featured flag (e.g. old localStorage data),
  // show the first 8 products so the homepage never appears empty.
  const displayProducts: Product[] = featuredProducts.length > 0
    ? featuredProducts
    : [...products]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
        .slice(0, 8);

  if (displayProducts.length === 0) return <></>;

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="overline"
            sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            {t('products.featured')}
          </Typography>
          <Typography variant="h2" sx={{ mt: 1 }}>
            {t('products.title')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {displayProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <ProductCard product={product} compact />
            </Grid>
          ))}
        </Grid>

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
      </Container>
    </Box>
  );
}

export default FeaturedProducts;
