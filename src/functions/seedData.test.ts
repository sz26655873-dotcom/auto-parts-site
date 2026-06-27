/**
 * Tests for the seed data module (functions-src/lib/seedData.ts).
 *
 * Verifies:
 * - getSeedProducts returns 16 products with required fields
 * - getSeedContactInfo returns valid contact data
 * - getSeedCompanyInfo returns valid company data with advantages
 * - getAllSeeds returns a map with the correct keys
 * - Seed data matches frontend DEFAULT values (critical for consistency)
 */

import { describe, it, expect } from 'vitest';
import {
  getSeedProducts,
  getSeedContactInfo,
  getSeedCompanyInfo,
  getAllSeeds,
} from '../../functions-src/lib/seedData';
import {
  DEFAULT_CONTACT_INFO,
  DEFAULT_COMPANY_INFO,
} from '../admin/adminStorage';

describe('seedData.ts — Seed data module', () => {
  describe('getSeedProducts', () => {
    it('should return 16 seed products', () => {
      const products = getSeedProducts();
      expect(products.length).toBe(16);
    });

    it('should have required fields on each product', () => {
      const products = getSeedProducts();
      for (const p of products) {
        expect(p.id).toBeDefined();
        expect(typeof p.id).toBe('number');
        expect(p.model).toBeDefined();
        expect(typeof p.model).toBe('string');
        expect(p.category).toBeDefined();
        expect(typeof p.category).toBe('string');
        expect(p.name).toBeDefined();
        expect(typeof p.name.en).toBe('string');
        expect(p.description).toBeDefined();
        expect(typeof p.description.en).toBe('string');
        expect(p.slug).toBeDefined();
        expect(typeof p.slug).toBe('string');
        expect(p.image).toBeDefined();
      }
    });

    it('should have correct first product data', () => {
      const products = getSeedProducts();
      expect(products[0].id).toBe(1);
      expect(products[0].model).toBe('CHG-2024');
      expect(products[0].category).toBe('engine');
      expect(products[0].oemNumber).toBe('OEM-90919-02231');
      expect(products[0].slug).toBe('engine-chg-2024');
    });

    it('should have applicable models on featured products', () => {
      const products = getSeedProducts();
      const featured = products.filter((p) => p.featured === true);
      expect(featured.length).toBeGreaterThan(0);
      for (const p of featured) {
        if (p.applicableModels) {
          expect(p.applicableModels.length).toBeGreaterThan(0);
          expect(p.applicableModels[0].brand).toBeDefined();
        }
      }
    });

    it('should have unique product IDs', () => {
      const products = getSeedProducts();
      const ids = products.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique slugs', () => {
      const products = getSeedProducts();
      const slugs = products.map((p) => p.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should have products across all categories', () => {
      const products = getSeedProducts();
      const categories = new Set(products.map((p) => p.category));
      expect(categories.has('engine')).toBe(true);
      expect(categories.has('chassis')).toBe(true);
      expect(categories.has('electrical')).toBe(true);
      expect(categories.has('body')).toBe(true);
    });
  });

  describe('getSeedContactInfo', () => {
    it('should match frontend DEFAULT_CONTACT_INFO', () => {
      const seed = getSeedContactInfo();
      expect(seed.whatsapp).toBe(DEFAULT_CONTACT_INFO.whatsapp);
      expect(seed.email).toBe(DEFAULT_CONTACT_INFO.email);
      expect(seed.phone).toBe(DEFAULT_CONTACT_INFO.phone);
      expect(seed.wechatId).toBe(DEFAULT_CONTACT_INFO.wechatId);
      expect(seed.address.en).toBe(DEFAULT_CONTACT_INFO.address.en);
      expect(seed.address.zh).toBe(DEFAULT_CONTACT_INFO.address.zh);
      expect(seed.wechatQrImage).toBe(DEFAULT_CONTACT_INFO.wechatQrImage);
    });

    it('should have all required fields', () => {
      const seed = getSeedContactInfo();
      expect(seed.whatsapp).toBeTruthy();
      expect(seed.email).toBeTruthy();
      expect(seed.phone).toBeTruthy();
      expect(seed.address).toBeDefined();
      expect(seed.address.en).toBeTruthy();
      expect(seed.address.zh).toBeTruthy();
      expect(seed.address.ru).toBeTruthy();
      expect(seed.address.ar).toBeTruthy();
      expect(seed.address.ko).toBeTruthy();
      expect(seed.wechatId).toBeTruthy();
    });
  });

  describe('getSeedCompanyInfo', () => {
    it('should have all required fields', () => {
      const seed = getSeedCompanyInfo();
      expect(seed.name).toBeDefined();
      expect(seed.name.en).toBeTruthy();
      expect(seed.stats).toBeDefined();
      expect(seed.stats.stat1).toBe(DEFAULT_COMPANY_INFO.stats.stat1);
      expect(seed.advantages).toBeDefined();
      expect(seed.advantages.oem).toBeDefined();
      expect(seed.advantages.shipping).toBeDefined();
      expect(seed.advantages.price).toBeDefined();
      expect(seed.advantages.exportAdv).toBeDefined();
    });

    it('should have localized advantage titles and descriptions', () => {
      const seed = getSeedCompanyInfo();
      for (const key of ['oem', 'shipping', 'price', 'exportAdv'] as const) {
        const adv = seed.advantages[key];
        expect(adv.title.en).toBeTruthy();
        expect(adv.title.zh).toBeTruthy();
        expect(adv.desc.en).toBeTruthy();
        expect(adv.desc.zh).toBeTruthy();
      }
    });

    it('should match frontend DEFAULT_COMPANY_INFO stats', () => {
      const seed = getSeedCompanyInfo();
      expect(seed.stats.stat1).toBe(DEFAULT_COMPANY_INFO.stats.stat1);
      expect(seed.stats.stat2).toBe(DEFAULT_COMPANY_INFO.stats.stat2);
      expect(seed.stats.stat3).toBe(DEFAULT_COMPANY_INFO.stats.stat3);
      expect(seed.stats.stat4).toBe(DEFAULT_COMPANY_INFO.stats.stat4);
    });
  });

  describe('getAllSeeds', () => {
    it('should return a map with products, contact_info, company_info keys', () => {
      const seeds = getAllSeeds();
      expect(typeof seeds).toBe('object');
      expect(seeds.products).toBeDefined();
      expect(seeds.contact_info).toBeDefined();
      expect(seeds.company_info).toBeDefined();
    });

    it('should return functions that produce valid data', () => {
      const seeds = getAllSeeds();
      const products = seeds.products();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(16);

      const contact = seeds.contact_info();
      expect(contact.whatsapp).toBeTruthy();

      const company = seeds.company_info();
      expect(company.name.en).toBeTruthy();
    });
  });
});
