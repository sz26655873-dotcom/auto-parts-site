/**
 * CategoryPage — product category listing at /products/category/:cat.
 *
 * Filters products by the URL parameter category and displays them
 * in a card grid. Includes breadcrumbs and category-specific SEO.
 */

import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import { productCategories, type Product } from '../data/products';
import Seo from '../components/seo/Seo';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';

/**
 * Renders a filtered product listing for a specific category.
 */
function CategoryPage(): JSX.Element {
  const { cat } = useParams<{ cat: string }>();
  const { t, lang } = useLanguage();
  const { products } = useAdminData();

  const category = productCategories.find((c) => c.id === cat);
  const categoryLabel = category?.label[lang] || cat || '';

  const filteredProducts: Product[] = [...products
    .filter((p) => p.category === cat)]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/' },
    { label: t('breadcrumb.products'), href: '/products' },
    { label: categoryLabel, href: `/products/category/${cat}` },
  ];

  return (
    <>
      <Seo
        title={`${categoryLabel} — Altai Auto Parts`}
        description={`Browse ${categoryLabel} from Altai Auto Parts. OEM quality, competitive pricing, fast shipping to 60+ countries.`}
        canonical={`/products/category/${cat}`}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />

        <Button
          component={Link}
          to="/products"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, textTransform: 'none' }}
        >
          {t('breadcrumb.products')}
        </Button>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            {t('category.title')}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
            {categoryLabel}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {filteredProducts.length} {t('category.productsCount')}
          </Typography>
        </Box>

        {filteredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found in this category.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}

export default CategoryPage;
