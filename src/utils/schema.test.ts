/**
 * Tests for Schema.org JSON-LD schema builders.
 *
 * Verifies that buildProductSchema and buildBreadcrumbSchema produce
 * valid Schema.org compliant JSON-LD objects.
 */

import { describe, it, expect } from 'vitest';
import { buildProductSchema, buildBreadcrumbSchema } from './schema';
import { SEO_CONFIG } from './seo';
import type { Product } from '../data/products';
import type { BreadcrumbItem } from '../components/Breadcrumb';

/** Minimal product fixture for testing. */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    model: 'CHG-2024',
    category: 'engine',
    image: '/images/engine1.jpg',
    slug: 'engine-chg-2024',
    name: {
      en: 'Cylinder Head Gasket',
      zh: '气缸盖垫片',
      ru: 'Прокладка',
      ar: 'جوان',
      ko: '가스켓',
    },
    description: {
      en: 'Premium OEM-grade cylinder head gasket',
      zh: '优质垫片',
      ru: 'Прокладка',
      ar: 'جوان',
      ko: '가스켓',
    },
    ...overrides,
  };
}

describe('buildProductSchema', () => {
  it('should produce a valid Product schema object', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Product');
  });

  it('should include product name from English localization', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;
    expect(schema.name).toBe('Cylinder Head Gasket');
  });

  it('should include image as absolute URL', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;
    expect(schema.image).toEqual([`${SEO_CONFIG.baseUrl}/images/engine1.jpg`]);
  });

  it('should use model as SKU', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;
    expect(schema.sku).toBe('CHG-2024');
  });

  it('should use oemNumber as MPN when available', () => {
    const product = makeProduct({ oemNumber: 'OEM-90919-02231' });
    const schema = buildProductSchema(product) as Record<string, unknown>;
    expect(schema.mpn).toBe('OEM-90919-02231');
  });

  it('should fall back to model as MPN when oemNumber is absent', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;
    expect(schema.mpn).toBe('CHG-2024');
  });

  it('should include category', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;
    expect(schema.category).toBe('engine');
  });

  it('should include English description', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;
    expect(schema.description).toBe('Premium OEM-grade cylinder head gasket');
  });

  it('should include brand information', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;
    const brand = schema.brand as Record<string, unknown>;
    expect(brand['@type']).toBe('Brand');
    expect(brand.name).toBe('Altai Auto Parts');
  });

  it('should include offer information', () => {
    const product = makeProduct();
    const schema = buildProductSchema(product) as Record<string, unknown>;
    const offers = schema.offers as Record<string, unknown>;

    expect(offers['@type']).toBe('Offer');
    expect(offers.priceCurrency).toBe('USD');
    expect(offers.availability).toBe('https://schema.org/InStock');
    const seller = offers.seller as Record<string, unknown>;
    expect(seller['@type']).toBe('Organization');
    expect(seller.name).toBe('Altai Auto Parts');
  });
});

describe('buildBreadcrumbSchema', () => {
  it('should produce a valid BreadcrumbList schema object', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
    ];
    const schema = buildBreadcrumbSchema(items) as Record<string, unknown>;

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
  });

  it('should map items to ListItem elements with correct positions', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Engine Parts', href: '/products/category/engine' },
    ];
    const schema = buildBreadcrumbSchema(items) as Record<string, unknown>;
    const elements = schema.itemListElement as Record<string, unknown>[];

    expect(elements).toHaveLength(3);
    expect(elements[0].position).toBe(1);
    expect(elements[1].position).toBe(2);
    expect(elements[2].position).toBe(3);
  });

  it('should include label as name for each item', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
    ];
    const schema = buildBreadcrumbSchema(items) as Record<string, unknown>;
    const elements = schema.itemListElement as Record<string, unknown>[];

    expect(elements[0].name).toBe('Home');
    expect(elements[1].name).toBe('Products');
  });

  it('should build absolute URLs for each item', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Product', href: '/products/engine-chg-2024' },
    ];
    const schema = buildBreadcrumbSchema(items) as Record<string, unknown>;
    const elements = schema.itemListElement as Record<string, unknown>[];

    expect(elements[0].item).toBe(`${SEO_CONFIG.baseUrl}/`);
    expect(elements[1].item).toBe(`${SEO_CONFIG.baseUrl}/products/engine-chg-2024`);
  });

  it('should handle empty items array', () => {
    const schema = buildBreadcrumbSchema([]) as Record<string, unknown>;
    expect(schema.itemListElement).toEqual([]);
  });

  it('should handle single item', () => {
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    const schema = buildBreadcrumbSchema(items) as Record<string, unknown>;
    const elements = schema.itemListElement as Record<string, unknown>[];

    expect(elements).toHaveLength(1);
    expect(elements[0].position).toBe(1);
  });
});
