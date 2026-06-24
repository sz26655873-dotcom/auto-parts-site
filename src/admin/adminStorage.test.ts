/**
 * Tests for the adminStorage localStorage persistence layer.
 *
 * Verifies that:
 * - Default values are returned when localStorage is empty (fallback logic)
 * - Data round-trips correctly through set/get
 * - Export/import JSON works as expected
 * - Reset clears all stored data
 * - Auth helpers correctly manage the sessionStorage flag
 *
 * Since vitest runs in a Node environment without localStorage, we mock
 * both localStorage and sessionStorage before each test.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getProducts,
  setProducts,
  getContactInfo,
  setContactInfo,
  getCompanyInfo,
  setCompanyInfo,
  exportData,
  importData,
  resetData,
  getDataVersion,
  getLastModified,
  isAuthenticated,
  setAuthenticated,
  ADMIN_PASSWORD,
  ADMIN_AUTH_KEY,
  CURRENT_DATA_VERSION,
  DEFAULT_CONTACT_INFO,
  DEFAULT_COMPANY_INFO,
} from './adminStorage';
import { products as seedProducts } from '../data/products';

/**
 * In-memory localStorage/sessionStorage mock.
 * Implements the standard Web Storage API surface used by adminStorage.
 */
class StorageMock {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

describe('adminStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new StorageMock());
    vi.stubGlobal('sessionStorage', new StorageMock());
  });

  describe('products fallback', () => {
    it('should return the seed products when localStorage is empty', () => {
      const result = getProducts();
      expect(result).toEqual(seedProducts);
      expect(result.length).toBe(16);
    });

    it('should return stored products when localStorage has data', () => {
      const custom = [
        {
          id: 999,
          model: 'TEST-001',
          category: 'engine',
          image: 'https://example.com/test.jpg',
          name: { en: 'Test', zh: '测试', ru: 'Тест', ar: 'اختبار', ko: '테스트' },
          description: { en: 'Desc', zh: '描述', ru: 'Описание', ar: 'وصف', ko: '설명' },
        },
      ];
      setProducts(custom);
      expect(getProducts()).toEqual(custom);
    });

    it('should fall back to defaults when stored data is invalid JSON', () => {
      localStorage.setItem('autoparts_products', '{invalid json}');
      expect(getProducts()).toEqual(seedProducts);
    });
  });

  describe('contact info fallback', () => {
    it('should return default contact info when localStorage is empty', () => {
      const result = getContactInfo();
      expect(result).toEqual(DEFAULT_CONTACT_INFO);
      expect(result.whatsapp).toBe('8613800138000');
      expect(result.email).toBe('sales@autoparts-export.com');
    });

    it('should return stored contact info when localStorage has data', () => {
      const custom = {
        ...DEFAULT_CONTACT_INFO,
        whatsapp: '1234567890',
        email: 'custom@test.com',
      };
      setContactInfo(custom);
      const result = getContactInfo();
      expect(result.whatsapp).toBe('1234567890');
      expect(result.email).toBe('custom@test.com');
    });

    it('should merge with defaults for missing fields', () => {
      const partial = { whatsapp: '999999' };
      localStorage.setItem('autoparts_contact_info', JSON.stringify(partial));
      const result = getContactInfo();
      expect(result.whatsapp).toBe('999999');
      expect(result.email).toBe(DEFAULT_CONTACT_INFO.email);
      expect(result.wechatId).toBe(DEFAULT_CONTACT_INFO.wechatId);
    });
  });

  describe('company info fallback', () => {
    it('should return default company info when localStorage is empty', () => {
      const result = getCompanyInfo();
      expect(result).toEqual(DEFAULT_COMPANY_INFO);
      expect(result.stats.stat1).toBe('500K+');
    });

    it('should return stored company info when localStorage has data', () => {
      const custom = {
        ...DEFAULT_COMPANY_INFO,
        stats: { ...DEFAULT_COMPANY_INFO.stats, stat1: '1M+' },
      };
      setCompanyInfo(custom);
      const result = getCompanyInfo();
      expect(result.stats.stat1).toBe('1M+');
    });

    it('should deep-merge advantages with defaults', () => {
      const partial = {
        advantages: {
          oem: { title: { en: 'Custom', zh: 'Custom', ru: 'Custom', ar: 'Custom', ko: 'Custom' } },
        },
      };
      localStorage.setItem('autoparts_company_info', JSON.stringify(partial));
      const result = getCompanyInfo();
      expect(result.advantages.oem.title.en).toBe('Custom');
      // desc should fall back to default
      expect(result.advantages.oem.desc).toEqual(DEFAULT_COMPANY_INFO.advantages.oem.desc);
    });
  });

  describe('data version and metadata', () => {
    it('should return current data version when no version is stored', () => {
      expect(getDataVersion()).toBe(CURRENT_DATA_VERSION);
    });

    it('should return null lastModified when no data has been saved', () => {
      expect(getLastModified()).toBeNull();
    });

    it('should set lastModified after saving data', () => {
      setProducts(seedProducts);
      const lastMod = getLastModified();
      expect(lastMod).not.toBeNull();
      expect(new Date(lastMod!).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('export and import', () => {
    it('should export valid JSON with all data', () => {
      const json = exportData();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed).toHaveProperty('products');
      expect(parsed).toHaveProperty('contactInfo');
      expect(parsed).toHaveProperty('companyInfo');
      expect(Array.isArray(parsed.products)).toBe(true);
    });

    it('should import data from valid JSON', () => {
      const original = exportData();
      // Modify localStorage
      setProducts([
        {
          id: 1,
          model: 'CHANGED',
          category: 'engine',
          image: 'https://example.com/img.jpg',
          name: { en: 'Changed', zh: 'Changed', ru: 'Changed', ar: 'Changed', ko: 'Changed' },
          description: { en: 'Changed', zh: 'Changed', ru: 'Changed', ar: 'Changed', ko: 'Changed' },
        },
      ]);
      // Import original data
      const success = importData(original);
      expect(success).toBe(true);
      expect(getProducts()).toEqual(seedProducts);
    });

    it('should return false for invalid JSON', () => {
      expect(importData('not json')).toBe(false);
    });

    it('should return false for JSON missing required fields', () => {
      expect(importData(JSON.stringify({ foo: 'bar' }))).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear all stored data', () => {
      setProducts(seedProducts);
      setContactInfo(DEFAULT_CONTACT_INFO);
      setCompanyInfo(DEFAULT_COMPANY_INFO);
      expect(localStorage.getItem('autoparts_products')).not.toBeNull();
      expect(localStorage.getItem('autoparts_contact_info')).not.toBeNull();

      resetData();

      expect(localStorage.getItem('autoparts_products')).toBeNull();
      expect(localStorage.getItem('autoparts_contact_info')).toBeNull();
      expect(localStorage.getItem('autoparts_company_info')).toBeNull();
    });

    it('should cause getters to return defaults after reset', () => {
      setProducts([
        {
          id: 1,
          model: 'X',
          category: 'engine',
          image: 'https://example.com/x.jpg',
          name: { en: 'X', zh: 'X', ru: 'X', ar: 'X', ko: 'X' },
          description: { en: 'X', zh: 'X', ru: 'X', ar: 'X', ko: 'X' },
        },
      ]);
      resetData();
      expect(getProducts()).toEqual(seedProducts);
    });
  });

  describe('authentication', () => {
    it('should return false when not authenticated', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true after setAuthenticated(true)', () => {
      setAuthenticated(true);
      expect(isAuthenticated()).toBe(true);
      expect(sessionStorage.getItem(ADMIN_AUTH_KEY)).toBe('true');
    });

    it('should return false after setAuthenticated(false)', () => {
      setAuthenticated(true);
      setAuthenticated(false);
      expect(isAuthenticated()).toBe(false);
    });

    it('should have the expected admin password', () => {
      expect(ADMIN_PASSWORD).toBe('admin2024');
    });
  });
});
