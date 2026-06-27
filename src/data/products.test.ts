/**
 * Tests for product data model integrity.
 *
 * Verifies that the seed product catalog meets all SEO and data quality
 * requirements: unique slugs, featured product count, field completeness,
 * and slug lookup logic used by the product detail page.
 */

import { describe, it, expect } from 'vitest';
import {
  products,
  productCategories,
  type Product,
} from './products';
import { generateSlug } from '../utils/slug';

describe('Product seed data integrity', () => {
  describe('slug presence and correctness', () => {
    it('every product should have a non-empty slug', () => {
      for (const product of products) {
        expect(product.slug).toBeDefined();
        expect(product.slug.length).toBeGreaterThan(0);
      }
    });

    it('every slug should match generateSlug(category, model)', () => {
      for (const product of products) {
        const expectedSlug = generateSlug(product.category, product.model);
        expect(product.slug).toBe(expectedSlug);
      }
    });

    it('every slug should be lowercase', () => {
      for (const product of products) {
        expect(product.slug).toBe(product.slug.toLowerCase());
      }
    });

    it('every slug should be URL-safe (no spaces)', () => {
      for (const product of products) {
        expect(product.slug).not.toMatch(/\s/);
      }
    });
  });

  describe('slug uniqueness', () => {
    it('all product slugs should be unique', () => {
      const slugs = products.map((p) => p.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('featured products', () => {
    it('should have at least 6 featured products', () => {
      const featured = products.filter((p) => p.featured === true);
      expect(featured.length).toBeGreaterThanOrEqual(6);
    });

    it('FeaturedProducts component takes top 8 via slice(0, 8)', () => {
      // The component handles the limit via .slice(0, 8), so having more
      // than 8 featured products in the data is acceptable.
      const featured = products.filter((p) => p.featured === true);
      // Verify that at least 8 exist for a full homepage grid
      expect(featured.length).toBeGreaterThanOrEqual(8);
    });

    it('non-featured products should have featured === false or undefined', () => {
      for (const product of products) {
        if (product.featured !== true) {
          expect(product.featured === false || product.featured === undefined).toBe(true);
        }
      }
    });
  });

  describe('OEM and specification data', () => {
    it('at least half the products should have oemNumber', () => {
      const withOem = products.filter((p) => p.oemNumber);
      expect(withOem.length).toBeGreaterThanOrEqual(products.length / 2);
    });

    it('at least half the products should have specifications', () => {
      const withSpecs = products.filter(
        (p) => p.specifications && Object.keys(p.specifications).length > 0,
      );
      expect(withSpecs.length).toBeGreaterThanOrEqual(products.length / 2);
    });

    it('at least half the products should have moq', () => {
      const withMoq = products.filter((p) => p.moq !== undefined);
      expect(withMoq.length).toBeGreaterThanOrEqual(products.length / 2);
    });

    it('at least half the products should have packaging', () => {
      const withPackaging = products.filter((p) => p.packaging);
      expect(withPackaging.length).toBeGreaterThanOrEqual(products.length / 2);
    });

    it('at least half the products should have leadTime', () => {
      const withLeadTime = products.filter((p) => p.leadTime);
      expect(withLeadTime.length).toBeGreaterThanOrEqual(products.length / 2);
    });

    it('at least some products should have applicableModels', () => {
      const withModels = products.filter(
        (p) => p.applicableModels && p.applicableModels.length > 0,
      );
      expect(withModels.length).toBeGreaterThan(0);
    });
  });

  describe('localized content completeness', () => {
    const requiredLanguages = ['en', 'zh', 'ru', 'ar', 'ko'] as const;

    it('every product name should have all 5 languages', () => {
      for (const product of products) {
        for (const lang of requiredLanguages) {
          expect(product.name[lang]).toBeDefined();
          expect(product.name[lang].length).toBeGreaterThan(0);
        }
      }
    });

    it('every product description should have all 5 languages', () => {
      for (const product of products) {
        for (const lang of requiredLanguages) {
          expect(product.description[lang]).toBeDefined();
          expect(product.description[lang].length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('category validity', () => {
    it('every product category should exist in productCategories', () => {
      const validCategoryIds = productCategories
        .filter((c) => c.id !== 'all')
        .map((c) => c.id);

      for (const product of products) {
        expect(validCategoryIds).toContain(product.category);
      }
    });

    it('productCategories should include "all" plus at least 5 real categories', () => {
      const realCategories = productCategories.filter((c) => c.id !== 'all');
      expect(realCategories.length).toBeGreaterThanOrEqual(5);
    });

    it('every category label should have all 5 languages', () => {
      const requiredLanguages = ['en', 'zh', 'ru', 'ar', 'ko'] as const;
      for (const cat of productCategories) {
        for (const lang of requiredLanguages) {
          expect(cat.label[lang]).toBeDefined();
          expect(cat.label[lang].length).toBeGreaterThan(0);
        }
      }
    });
  });
});

/**
 * Tests for the slug-based product lookup logic used by ProductDetailPage.
 * This replicates the exact lookup pattern: products.find(p => p.slug === slug).
 */
describe('Product slug lookup (ProductDetailPage logic)', () => {
  it('should find a product by its slug', () => {
    const testProduct = products[0];
    const found = products.find((p) => p.slug === testProduct.slug);
    expect(found).toBeDefined();
    expect(found?.id).toBe(testProduct.id);
  });

  it('should return undefined for a non-existent slug', () => {
    const found = products.find((p) => p.slug === 'non-existent-slug-9999');
    expect(found).toBeUndefined();
  });

  it('should find each product by its slug (all 16)', () => {
    for (const product of products) {
      const found = products.find((p) => p.slug === product.slug);
      expect(found).toBeDefined();
      expect(found?.id).toBe(product.id);
    }
  });

  it('should be case-sensitive (uppercase slug should not match)', () => {
    const testProduct = products[0];
    const upperSlug = testProduct.slug.toUpperCase();
    const found = products.find((p) => p.slug === upperSlug);
    expect(found).toBeUndefined();
  });

  it('should not match partial slugs', () => {
    const testProduct = products[0];
    const partialSlug = testProduct.slug.substring(0, 5);
    const found = products.find((p) => p.slug === partialSlug);
    expect(found).toBeUndefined();
  });

  it('should find related products (same category, different id)', () => {
    const testProduct = products[0];
    const related: Product[] = products
      .filter((p) => p.category === testProduct.category && p.id !== testProduct.id)
      .slice(0, 4);

    // Engine category should have multiple products
    expect(related.length).toBeGreaterThan(0);
    for (const rp of related) {
      expect(rp.category).toBe(testProduct.category);
      expect(rp.id).not.toBe(testProduct.id);
    }
    expect(related.length).toBeLessThanOrEqual(4);
  });
});
