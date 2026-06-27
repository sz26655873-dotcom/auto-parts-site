/**
 * Breadcrumb component — renders an MUI Breadcrumbs navigation trail
 * and injects a BreadcrumbList JSON-LD schema for SEO.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *   ]} />
 */

import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import JsonLd from './seo/JsonLd';
import { buildBreadcrumbSchema } from '../utils/schema';

/** A single breadcrumb item with display label and route path. */
export interface BreadcrumbItem {
  /** Display text for the breadcrumb. */
  label: string;
  /** Route path (e.g. "/", "/products"). */
  href: string;
}

interface BreadcrumbProps {
  /** Ordered list of breadcrumb items from home to current page. */
  items: BreadcrumbItem[];
}

/**
 * Renders a breadcrumb navigation trail with structured data.
 * The last item is rendered as non-clickable text (current page).
 */
function Breadcrumb({ items }: BreadcrumbProps): JSX.Element {
  return (
    <Box sx={{ py: 2 }}>
      <Breadcrumbs aria-label="breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          if (isLast) {
            return (
              <Typography
                key={item.href}
                color="text.primary"
                sx={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                {item.label}
              </Typography>
            );
          }
          return (
            <Link
              key={item.href}
              component={RouterLink}
              to={item.href}
              underline="hover"
              color="inherit"
              sx={{ fontSize: '0.875rem' }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
      <JsonLd schema={buildBreadcrumbSchema(items)} />
    </Box>
  );
}

export default Breadcrumb;
