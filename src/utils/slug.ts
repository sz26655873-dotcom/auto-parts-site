/**
 * URL slug generation utility.
 *
 * Slugs are used in product detail page routes (/products/:slug) and
 * must be unique, lowercase, and URL-safe. A slug is derived from the
 * product's category and model number.
 */

/**
 * Generate a URL-friendly slug from category and model.
 *
 * Example: generateSlug('engine', 'CHG-2024') → 'engine-chg-2024'
 *
 * @param category - The product category id (e.g. "engine", "brake").
 * @param model - The product model number (e.g. "CHG-2024").
 * @returns A lowercase, hyphen-separated slug string.
 */
export function generateSlug(category: string, model: string): string {
  return `${category}-${model}`.toLowerCase().replace(/\s+/g, '-');
}
