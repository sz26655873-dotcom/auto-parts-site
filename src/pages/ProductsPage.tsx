/**
 * ProductsPage — product catalog page at /products.
 *
 * Left sidebar with brand logos (sticky), product grid on the right.
 * All brands shown regardless of whether they have products.
 * Mobile: horizontal scrollable brand bar at top.
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useLanguage } from '../i18n/LanguageContext';
import { useAdminData } from '../admin/AdminDataContext';
import type { Product } from '../data/products';
import Seo from '../components/seo/Seo';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import { productCategories } from '../data/products';
import { useTrackView } from '../hooks/useTrackView';

function ProductsPage(): JSX.Element {
  const { t, lang } = useLanguage();
  const { products } = useAdminData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  useTrackView('page', 'products');

  // All brand categories (excluding "all")
  const allBrands = useMemo(
    () => productCategories.filter((c) => c.id !== 'all'),
    [],
  );

  // Active brand: null = show all
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  // Filtered products
  const displayProducts = useMemo<Product[]>(() => {
    let list: Product[] = activeBrand
      ? products.filter((p) => p.category === activeBrand)
      : products;
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
  }, [products, activeBrand]);

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/' },
    { label: t('breadcrumb.products'), href: '/products' },
  ];

  // Brand item component (shared between sidebar and mobile bar)
  const BrandItem = ({ brand, isActive, onClick }: {
    brand: typeof allBrands[number] | null;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isActive ? '2px solid' : '1px solid',
        borderColor: isActive ? 'secondary.main' : 'divider',
        bgcolor: isActive ? 'secondary.main' : 'background.paper',
        color: isActive ? '#fff' : 'text.primary',
        '&:hover': {
          borderColor: 'secondary.main',
          bgcolor: isActive ? 'secondary.main' : 'rgba(255,107,0,0.06)',
        },
      }}
    >
      {brand?.logo && (
        <img
          src={brand.logo}
          alt={brand?.label[lang]}
          style={{ width: 28, height: 28, objectFit: 'contain' }}
        />
      )}
      {!brand?.logo && (
        <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>
          ALL
        </Typography>
      )}
      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1 }}>
        {brand ? brand.label[lang] : (productCategories.find((c) => c.id === 'all')?.label[lang] || 'All Products')}
      </Typography>
    </Paper>
  );

  return (
    <>
      <Seo
        title="Auto Parts Catalog"
        description="Browse our comprehensive range of OEM-grade automotive parts. Engine parts, brake systems, suspension, electrical, body parts and filters available for global export."
        canonical="/products"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />

        {/* Mobile: horizontal scrollable brand bar */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              mb: 4,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
            }}
          >
            <BrandItem
              brand={null}
              isActive={activeBrand === null}
              onClick={() => setActiveBrand(null)}
            />
            {allBrands.map((brand) => (
              <BrandItem
                key={brand.id}
                brand={brand}
                isActive={activeBrand === brand.id}
                onClick={() => setActiveBrand(brand.id)}
              />
            ))}
          </Box>
        )}

        {/* Desktop: left sidebar + product grid */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Sticky left sidebar */}
            <Box
              sx={{
                width: 180,
                flexShrink: 0,
                position: 'sticky',
                top: 80,
                alignSelf: 'flex-start',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <BrandItem
                brand={null}
                isActive={activeBrand === null}
                onClick={() => setActiveBrand(null)}
              />
              {allBrands.map((brand) => (
                <BrandItem
                  key={brand.id}
                  brand={brand}
                  isActive={activeBrand === brand.id}
                  onClick={() => setActiveBrand(brand.id)}
                />
              ))}
            </Box>

            {/* Product grid — right side */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {displayProducts.length > 0 && (
                <Grid container spacing={3}>
                  {displayProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {displayProducts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    {activeBrand
                      ? 'No products in this category yet.'
                      : 'No products available yet.'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Check back soon — new parts are being added regularly.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Mobile: product grid (full width) */}
        {isMobile && displayProducts.length > 0 && (
          <Grid container spacing={2}>
            {displayProducts.map((product) => (
              <Grid item xs={12} sm={6} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}

        {isMobile && displayProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {activeBrand
                ? 'No products in this category yet.'
                : 'No products available yet.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back soon — new parts are being added regularly.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}

export default ProductsPage;
