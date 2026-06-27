/**
 * ProductDetailPage — full product detail view at /products/:slug.
 *
 * Renders SEO meta tags, JSON-LD structured data, breadcrumbs,
 * product gallery, specifications, applicable models, and related products.
 */

import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import { productCategories, type Product } from '../data/products';
import Seo from '../components/seo/Seo';
import JsonLd from '../components/seo/JsonLd';
import Breadcrumb from '../components/Breadcrumb';
import ProductGallery from '../components/ProductGallery';
import ProductCard from '../components/ProductCard';
import NotFoundPage from './NotFoundPage';
import { buildProductSchema } from '../utils/schema';
import {
  buildProductMetaTitle,
  buildProductMetaDescription,
  buildCanonical,
} from '../utils/seo';
import { useTrackView } from '../hooks/useTrackView';

/**
 * Renders the full product detail page with SEO and structured data.
 */
function ProductDetailPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useLanguage();
  const { products, contactInfo } = useAdminData();

  const product: Product | undefined = products.find((p) => p.slug === slug);

  // Track product view (once per session)
  useTrackView('product', product?.slug || '');

  // Product not found — render 404 page
  if (!product) {
    return <NotFoundPage />;
  }

  const displayName = product.name[lang];
  const category = productCategories.find((c) => c.id === product.category);
  const categoryLabel = category?.label[lang] || product.category;

  // Related products: same category, exclude current, sorted by sortOrder, take 4
  const relatedProducts: Product[] = [...products
    .filter((p) => p.category === product.category && p.id !== product.id)]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
    .slice(0, 4);

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/' },
    { label: t('breadcrumb.products'), href: '/products' },
    { label: categoryLabel, href: `/products/category/${product.category}` },
    { label: displayName, href: `/products/${product.slug}` },
  ];

  const metaTitle = buildProductMetaTitle(product, lang);
  const metaDescription = buildProductMetaDescription(product, lang);
  const canonicalPath = `/products/${product.slug}`;

  // WhatsApp inquiry link
  const whatsappLink = `https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent(
    `Inquiry: ${displayName} (${product.model})`,
  )}`;

  return (
    <>
      <Seo
        title={metaTitle}
        description={metaDescription}
        canonical={canonicalPath}
        ogType="product"
        ogImage={product.image}
      />
      <JsonLd schema={buildProductSchema(product)} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />

        {/* Back link */}
        <Button
          component={Link}
          to="/products"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, textTransform: 'none' }}
        >
          {t('breadcrumb.products')}
        </Button>

        <Grid container spacing={4}>
          {/* Left: Gallery */}
          <Grid item xs={12} md={6}>
            <ProductGallery product={product} />
          </Grid>

          {/* Right: Product info */}
          <Grid item xs={12} md={6}>
            {categoryLabel && (
              <Chip
                label={categoryLabel}
                sx={{
                  mb: 2,
                  backgroundColor: 'primary.light',
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
            )}
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {displayName}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontFamily: 'monospace', fontWeight: 600, mb: 3 }}
            >
              {t('products.model')}: {product.model}
            </Typography>

            {/* OEM Number */}
            {product.oemNumber && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  {t('productDetail.oemNumber')}
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {product.oemNumber}
                </Typography>
              </Box>
            )}

            {/* SEO Title — clean tagline above CTA */}
            {product.metaTitle?.[lang] && (
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 3,
                  pl: 2,
                  py: 0.5,
                  borderLeft: 4,
                  borderColor: 'primary.main',
                  fontWeight: 700,
                  lineHeight: 1.5,
                  color: 'text.primary',
                }}
              >
                {product.metaTitle[lang]}
              </Typography>
            )}

            {/* CTA buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon />}
                sx={{ textTransform: 'none' }}
              >
                {t('productDetail.requestQuote')}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/contact"
                sx={{ textTransform: 'none' }}
              >
                {t('nav.contact')}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Product Description section — heading + SEO description + detailed description */}
        {(product.metaDescription?.[lang] || product.description[lang]) && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {t('productDetail.description')}
            </Typography>
            {product.metaDescription?.[lang] && (
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2, fontWeight: 600 }}>
                {product.metaDescription[lang]}
              </Typography>
            )}
            {product.description[lang] && (
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                {product.description[lang]}
              </Typography>
            )}
          </Box>
        )}

        {/* Specifications table */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {t('productDetail.specifications')}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableBody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell
                        sx={{ fontWeight: 700, width: '40%', backgroundColor: '#F8FAFC' }}
                      >
                        {key}
                      </TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Applicable models table */}
        {product.applicableModels && product.applicableModels.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {t('productDetail.applicableModels')}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      {t('productDetail.brand')}
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      {t('products.model')}
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      {t('productDetail.year')}
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      {t('productDetail.engine')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.applicableModels.map((model, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{model.brand}</TableCell>
                      <TableCell>{model.model}</TableCell>
                      <TableCell>{model.year}</TableCell>
                      <TableCell>{model.engine || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              {t('productDetail.relatedProducts')}
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((rp) => (
                <Grid item xs={12} sm={6} md={3} key={rp.id}>
                  <ProductCard product={rp} compact />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
}

export default ProductDetailPage;
