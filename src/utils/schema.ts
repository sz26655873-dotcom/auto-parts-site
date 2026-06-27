/**
 * JSON-LD structured data schema builders.
 *
 * Generates Schema.org compliant JSON-LD objects for Product and
 * BreadcrumbList schemas. These are injected via the <JsonLd> component
 * to provide search engines with structured data for rich results.
 */

import type { Product } from '../data/products';
import type { BreadcrumbItem } from '../components/Breadcrumb';
import { SEO_CONFIG } from './seo';

/**
 * Builds a Schema.org Product JSON-LD object for a given product.
 *
 * Includes product name, image, SKU (model), MPN (OEM number),
 * category, description, brand, and offer information.
 *
 * @param product - The product to build the schema for.
 * @returns A JSON-LD object ready for serialization.
 */
export function buildProductSchema(product: Product): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name.en,
    image: [`${SEO_CONFIG.baseUrl}${product.image}`],
    sku: product.model,
    mpn: product.oemNumber || product.model,
    category: product.category,
    description: product.description.en,
    brand: { '@type': 'Brand', name: 'Altai Auto Parts' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Altai Auto Parts' },
    },
  };
}

/**
 * Builds a Schema.org BreadcrumbList JSON-LD object.
 *
 * Each breadcrumb item is mapped to a ListItem with position, name,
 * and absolute URL.
 *
 * @param items - Array of breadcrumb items with label and href.
 * @returns A JSON-LD BreadcrumbList object ready for serialization.
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SEO_CONFIG.baseUrl}${item.href}`,
    })),
  };
}
