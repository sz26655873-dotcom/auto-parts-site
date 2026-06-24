import { describe, it, expect } from 'vitest';
import { products, productCategories, type Product } from './products';
import type { Language } from '../i18n/translations';

const allLangs: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];

describe('product data integrity', () => {
  describe('product count', () => {
    it('should have at least 12 products', () => {
      expect(products.length).toBeGreaterThanOrEqual(12);
    });

    it('should have exactly 16 products as documented', () => {
      expect(products.length).toBe(16);
    });
  });

  describe('product structure', () => {
    it('every product should have all required fields', () => {
      products.forEach((p: Product) => {
        expect(p).toHaveProperty('id');
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('model');
        expect(p).toHaveProperty('category');
        expect(p).toHaveProperty('image');
        expect(p).toHaveProperty('description');
      });
    });

    it('every product name should be a localized object with all 5 languages', () => {
      products.forEach((p: Product) => {
        expect(typeof p.name).toBe('object');
        allLangs.forEach((l) => {
          expect(p.name).toHaveProperty(l);
          expect(typeof p.name[l]).toBe('string');
          expect(p.name[l].length).toBeGreaterThan(0);
        });
      });
    });

    it('every product description should be a localized object with all 5 languages', () => {
      products.forEach((p: Product) => {
        expect(typeof p.description).toBe('object');
        allLangs.forEach((l) => {
          expect(p.description).toHaveProperty(l);
          expect(typeof p.description[l]).toBe('string');
          expect(p.description[l].length).toBeGreaterThan(0);
        });
      });
    });

    it('every product should have non-empty model, category, and image', () => {
      products.forEach((p: Product) => {
        expect(typeof p.model).toBe('string');
        expect(p.model.length).toBeGreaterThan(0);
        expect(typeof p.category).toBe('string');
        expect(p.category.length).toBeGreaterThan(0);
        expect(typeof p.image).toBe('string');
        expect(p.image.length).toBeGreaterThan(0);
      });
    });

    it('every product id should be a unique number', () => {
      const ids = products.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('every product should have a valid image URL', () => {
      products.forEach((p: Product) => {
        expect(p.image).toMatch(/^https?:\/\/.+/);
      });
    });
  });

  describe('category validation', () => {
    const validCategoryIds = productCategories.map((c) => c.id);

    it('every product category should match a defined category (excluding "all")', () => {
      const productCategoryIds = validCategoryIds.filter((id) => id !== 'all');
      products.forEach((p: Product) => {
        expect(productCategoryIds).toContain(p.category);
      });
    });

    it('should include the "all" filter category', () => {
      expect(validCategoryIds).toContain('all');
    });

    it('should have at least 6 product categories plus "all"', () => {
      expect(productCategories.length).toBeGreaterThanOrEqual(7);
    });

    it('every category label should be a localized object with all 5 languages', () => {
      productCategories.forEach((c) => {
        expect(typeof c.label).toBe('object');
        allLangs.forEach((l) => {
          expect(c.label).toHaveProperty(l);
          expect(typeof c.label[l]).toBe('string');
          expect(c.label[l].length).toBeGreaterThan(0);
        });
      });
    });

    it('every product category should have at least one product', () => {
      const productCategoryIds = validCategoryIds.filter((id) => id !== 'all');
      productCategoryIds.forEach((catId) => {
        const count = products.filter((p) => p.category === catId).length;
        expect(count).toBeGreaterThanOrEqual(1);
      });
    });

    it('category ids should be unique', () => {
      const ids = productCategories.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('category filter logic', () => {
    // Replicate the filtering logic used in Products.tsx
    function filterProducts(category: string): Product[] {
      if (category === 'all') return products;
      return products.filter((p) => p.category === category);
    }

    it('should return all products when category is "all"', () => {
      expect(filterProducts('all').length).toBe(products.length);
    });

    it('should return only products of the given category', () => {
      const engineProducts = filterProducts('engine');
      expect(engineProducts.length).toBeGreaterThan(0);
      engineProducts.forEach((p) => {
        expect(p.category).toBe('engine');
      });
    });

    it('should return empty array for a non-existent category', () => {
      expect(filterProducts('nonexistent').length).toBe(0);
    });

    it('should correctly filter each defined category', () => {
      productCategories
        .filter((c) => c.id !== 'all')
        .forEach((cat) => {
          const filtered = filterProducts(cat.id);
          expect(filtered.length).toBeGreaterThan(0);
          filtered.forEach((p) => {
            expect(p.category).toBe(cat.id);
          });
        });
    });
  });
});
