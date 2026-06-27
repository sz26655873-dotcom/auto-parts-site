/**
 * ProductCard — reusable product card component for grids.
 *
 * Displays the product image, category chip, name, model, and a link
 * to the product detail page. In compact mode (used on the homepage),
 * the layout is more condensed.
 *
 * Replaces the inline ProductCard previously defined in Products.tsx.
 */

import {
  Card,
  CardMedia,
  CardContent,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { productCategories, type Product } from '../data/products';

interface ProductCardProps {
  /** The product to display. */
  product: Product;
  /** When true, renders a more condensed layout for homepage use. */
  compact?: boolean;
}

/**
 * Renders a clickable product card that navigates to the detail page.
 */
function ProductCard({ product, compact = false }: ProductCardProps): JSX.Element {
  const { t, lang } = useLanguage();

  const displayName = product.name[lang];
  const category = productCategories.find((c) => c.id === product.category);
  const categoryLabel = category?.label[lang];

  return (
    <Card
      component={Link}
      to={`/products/${product.slug}`}
      sx={{
        display: 'block',
        textDecoration: 'none',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(10,35,66,0.15)',
        },
      }}
    >
      <CardMedia
        component="img"
        height={compact ? 160 : 200}
        image={product.image}
        alt={displayName}
        loading="lazy"
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ pb: compact ? 1.5 : 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, flexWrap: 'wrap' }}>
          {categoryLabel && (
            <Chip
              label={categoryLabel}
              size="small"
              sx={{
                backgroundColor: 'primary.light',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: '22px',
              }}
            />
          )}
          {product.featured && (
            <Chip
              label={`★ ${t('products.featured')}`}
              size="small"
              sx={{
                backgroundColor: 'secondary.light',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: '22px',
              }}
            />
          )}
        </Box>
        <Typography
          variant={compact ? 'subtitle1' : 'h6'}
          sx={{ fontWeight: 700, mb: 0.5 }}
        >
          {(() => {
            const mt = product.metaTitle;
            if (mt && typeof mt === 'object') return mt[lang] || mt.en || displayName;
            if (typeof mt === 'string' && mt) return mt;
            return displayName;
          })()}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
        >
          {t('products.model')}: {product.model}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
