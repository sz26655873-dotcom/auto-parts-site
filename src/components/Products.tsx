import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from '../i18n/LanguageContext';
import {
  productCategories,
  type Product,
} from '../data/products';
import { useAdminData } from '../admin/AdminDataContext';
import { buildProductInquiryLink } from '../utils/whatsapp';

/**
 * Product card — displays image, name, model, and an Inquire button
 * that opens WhatsApp with a pre-filled product-specific message.
 * All text is rendered in the currently selected language.
 */
function ProductCard({ product }: { product: Product }): JSX.Element {
  const { t, lang } = useLanguage();
  const { contactInfo } = useAdminData();

  const displayName = product.name[lang];
  const category = productCategories.find((c) => c.id === product.category);
  const categoryLabel = category?.label[lang];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(10,35,66,0.15)',
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={displayName}
        loading="lazy"
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {categoryLabel && (
          <Chip
            label={categoryLabel}
            size="small"
            sx={{
              mb: 1,
              backgroundColor: 'primary.light',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {displayName}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
        >
          {t('products.model')}: {product.model}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, display: { xs: 'none', sm: 'block' } }}
        >
          {product.description[lang]}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          href={buildProductInquiryLink(displayName, product.model, lang, contactInfo.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<WhatsAppIcon />}
        >
          {t('products.inquire')}
        </Button>
      </CardActions>
    </Card>
  );
}

/**
 * Products section — category filter tabs + responsive product grid.
 * Category labels and product text adapt to the selected language.
 */
function Products(): JSX.Element {
  const { t, lang } = useLanguage();
  const { products } = useAdminData();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts = useMemo<Product[]>(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  const handleTabChange = (_event: unknown, newValue: string): void => {
    setActiveCategory(newValue);
  };

  return (
    <Box id="products" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="overline"
            sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            {t('products.badge')}
          </Typography>
          <Typography variant="h2" sx={{ mt: 1, mb: 2 }}>
            {t('products.title')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            {t('products.subtitle')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
          <Tabs
            value={activeCategory}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 48,
              },
              '& .Mui-selected': { color: 'primary.main' },
              '& .MuiTabs-indicator': {
                backgroundColor: 'secondary.main',
                height: 3,
              },
            }}
          >
            {productCategories.map((cat) => (
              <Tab
                key={cat.id}
                value={cat.id}
                label={cat.label[lang]}
              />
            ))}
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Products;
