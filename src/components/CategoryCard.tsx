/**
 * CategoryCard — clickable card for a product category.
 *
 * Displays a category icon, name, and product count. Clicking the
 * card navigates to the category page (/products/category/:id).
 */

import { Box, Typography, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import BoltIcon from '@mui/icons-material/Bolt';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SpeedIcon from '@mui/icons-material/Speed';
import type { ProductCategory } from '../data/products';
import { useLanguage } from '../i18n/LanguageContext';

interface CategoryCardProps {
  /** The category to display. */
  category: ProductCategory;
}

/** Icon mapping for each category id. */
const categoryIcons: Record<string, JSX.Element> = {
  engine: <PrecisionManufacturingIcon sx={{ fontSize: 40 }} />,
  chassis: <MiscellaneousServicesIcon sx={{ fontSize: 40 }} />,
  electrical: <BoltIcon sx={{ fontSize: 40 }} />,
  body: <DirectionsCarIcon sx={{ fontSize: 40 }} />,
  tuning: <SpeedIcon sx={{ fontSize: 40 }} />,
};

/** Fallback icon shown when category id has no explicit mapping. */
const FALLBACK_ICON = <PrecisionManufacturingIcon sx={{ fontSize: 40 }} />;

/** … */
function CategoryCard({ category }: CategoryCardProps): JSX.Element {
  const { lang } = useLanguage();
  const icon = categoryIcons[category.id] || FALLBACK_ICON;

  return (
    <Paper
      component={Link}
      to={`/products/category/${category.id}`}
      elevation={0}
      sx={{
        display: 'block',
        textDecoration: 'none',
        p: 3,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        transition: 'all 0.3s ease',
        height: '100%',
        '&:hover': {
          borderColor: 'secondary.main',
          boxShadow: '0 8px 25px rgba(255,107,0,0.12)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 72,
          height: 72,
          mb: 2,
          borderRadius: '50%',
          backgroundColor: 'primary.light',
          color: '#fff',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {category.label[lang]}
      </Typography>
    </Paper>
  );
}

export default CategoryCard;
