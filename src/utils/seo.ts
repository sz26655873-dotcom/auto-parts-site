/**
 * SEO configuration and meta-tag builder utilities.
 *
 * Centralises all site-wide SEO constants (site name, base URL, default OG image)
 * and provides helper functions to construct page titles, canonical URLs,
 * and product-specific meta tags.
 */

import type { Product, LocalizedString } from '../data/products';
import type { Language } from '../i18n/translations';

/** Global SEO configuration used across all pages. */
export const SEO_CONFIG = {
  siteName: 'Altai Auto Parts',
  baseUrl: 'https://www.altai.parts',
  defaultOgImage: 'https://www.altai.parts/og-image.png',
} as const;

/**
 * Builds a page title with the site name suffix.
 * Example: buildTitle('About') → 'About | Altai Auto Parts'
 *
 * @param pageTitle - The specific page title (without site name).
 * @returns Full title string with site name suffix.
 */
export function buildTitle(pageTitle: string): string {
  return `${pageTitle} | ${SEO_CONFIG.siteName}`;
}

/**
 * Builds an absolute canonical URL from a path.
 *
 * @param path - The URL path (e.g. "/products/engine-chg-2024").
 * @returns Full absolute URL.
 */
export function buildCanonical(path: string): string {
  return `${SEO_CONFIG.baseUrl}${path}`;
}

/**
 * Builds the meta title for a product page.
 * Uses the product's custom metaTitle (localized) if defined, otherwise falls back
 * to the product name and model.
 *
 * @param product - The product to build the title for.
 * @param lang - Current language for localized metaTitle lookup.
 * @returns The meta title string.
 */
export function buildProductMetaTitle(product: Product, lang: Language = 'en'): string {
  const custom = product.metaTitle;
  if (custom && typeof custom === 'object') {
    const ls = custom as LocalizedString;
    return ls[lang] || ls.en || `${product.name.en} ${product.model}`;
  }
  if (typeof custom === 'string' && custom) return custom;
  return `${product.name.en} ${product.model}`;
}

/**
 * Builds the meta description for a product page.
 * Uses the product's custom metaDescription (localized) if defined, otherwise falls back
 * to the English description. Truncates to 155 characters with ellipsis.
 *
 * @param product - The product to build the description for.
 * @param lang - Current language for localized metaDescription lookup.
 * @returns The meta description string (max 155 characters).
 */
export function buildProductMetaDescription(product: Product, lang: Language = 'en'): string {
  const custom = product.metaDescription;
  let desc: string;
  if (custom && typeof custom === 'object') {
    const ls = custom as LocalizedString;
    desc = ls[lang] || ls.en || '';
  } else if (typeof custom === 'string' && custom) {
    desc = custom;
  } else {
    desc = product.description[lang] || '';
  }
  return desc.length > 155 ? desc.substring(0, 152) + '...' : desc;
}

/**
 * Gets the display value for metaDescription on the product detail page.
 * Returns localized value or fallback to description[lang].
 */
export function getProductDisplayDescription(product: Product, lang: Language): string {
  const custom = product.metaDescription;
  if (custom && typeof custom === 'object') {
    const ls = custom as LocalizedString;
    return ls[lang] || ls.en || product.description[lang] || '';
  }
  if (typeof custom === 'string' && custom) return custom;
  return product.description[lang] || '';
}
