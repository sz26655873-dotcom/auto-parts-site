/**
 * Tests for the adminStorage module (localStorage cache, auth helpers, and types).
 *
 * Verifies that:
 * - Cache functions (cacheToLocalStorage, getCachedData, clearAllCache) work correctly
 * - Auth helpers (isAuthenticated, getAuthToken, setAuthToken, clearAuthToken) manage sessionStorage
 * - Legacy data detection (hasLegacyData, readLegacyData, clearLegacyData) works
 * - Default values and constants are exported correctly
 *
 * Since vitest runs in a Node environment without localStorage, we mock
 * both localStorage and sessionStorage before each test.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  ADMIN_AUTH_KEY,
  CURRENT_DATA_VERSION,
  DEFAULT_CONTACT_INFO,
  DEFAULT_COMPANY_INFO,
  DEFAULT_PRODUCTS,
  cacheToLocalStorage,
  getCachedData,
  clearAllCache,
  hasLegacyData,
  readLegacyData,
  clearLegacyData,
} from './adminStorage';

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

  describe('default values', () => {
    it('should export correct default contact info', () => {
      expect(DEFAULT_CONTACT_INFO.whatsapp).toBe('8615711970362');
      expect(DEFAULT_CONTACT_INFO.email).toBe('sz26655873@gmail.com');
      expect(DEFAULT_CONTACT_INFO.phone).toBe('+86 157 1197 0362');
      expect(DEFAULT_CONTACT_INFO.address.en).toBe('Guangzhou, China');
      expect(DEFAULT_CONTACT_INFO.wechatId).toBe('15711970362');
    });

    it('should export correct default company info', () => {
      expect(DEFAULT_COMPANY_INFO.name.en).toBe('Altai Auto Parts');
      expect(DEFAULT_COMPANY_INFO.stats.stat1).toBe('500K+');
      expect(DEFAULT_COMPANY_INFO.stats.stat2).toBe('60+');
      expect(DEFAULT_COMPANY_INFO.stats.stat3).toBe('2,000+');
      expect(DEFAULT_COMPANY_INFO.stats.stat4).toBe('800+');
    });

    it('should export 16 seed products', () => {
      expect(DEFAULT_PRODUCTS.length).toBe(16);
      expect(DEFAULT_PRODUCTS[0].id).toBe(1);
      expect(DEFAULT_PRODUCTS[0].model).toBe('CHG-2024');
    });

    it('should export current data version as 1', () => {
      expect(CURRENT_DATA_VERSION).toBe(1);
    });
  });

  describe('localStorage cache (offline fallback)', () => {
    it('should cache data with autoparts_cache_ prefix', () => {
      const testData = [{ id: 1, name: 'Test' }];
      cacheToLocalStorage('products', testData);
      const raw = localStorage.getItem('autoparts_cache_products');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(testData);
    });

    it('should retrieve cached data by key', () => {
      const testData = { whatsapp: '1234567890' };
      cacheToLocalStorage('contact_info', testData);
      const result = getCachedData('contact_info');
      expect(result).toEqual(testData);
    });

    it('should return null for keys with no cache', () => {
      expect(getCachedData('products')).toBeNull();
    });

    it('should return null for corrupted cache data', () => {
      localStorage.setItem('autoparts_cache_products', '{invalid json}');
      expect(getCachedData('products')).toBeNull();
    });

    it('should clear only cache entries, preserving other localStorage data', () => {
      cacheToLocalStorage('products', [1, 2, 3]);
      cacheToLocalStorage('contact_info', { test: true });
      localStorage.setItem('other_data', 'should survive');
      clearAllCache();
      expect(getCachedData('products')).toBeNull();
      expect(getCachedData('contact_info')).toBeNull();
      expect(localStorage.getItem('other_data')).toBe('should survive');
    });
  });

  describe('legacy localStorage data', () => {
    it('should detect legacy data when autoparts_* keys exist', () => {
      localStorage.setItem('autoparts_products', '[]');
      expect(hasLegacyData()).toBe(true);
    });

    it('should not detect legacy data when no autoparts_* keys exist', () => {
      expect(hasLegacyData()).toBe(false);
    });

    it('should ignore empty string values in legacy detection', () => {
      localStorage.setItem('autoparts_products', '');
      expect(hasLegacyData()).toBe(false);
    });

    it('should ignore "null" string values in legacy detection', () => {
      localStorage.setItem('autoparts_products', 'null');
      expect(hasLegacyData()).toBe(false);
    });

    it('should read legacy data from old localStorage keys', () => {
      const products = [{ id: 1, model: 'LEGACY-001' }];
      const contactInfo = { whatsapp: '9999999999' };
      localStorage.setItem('autoparts_products', JSON.stringify(products));
      localStorage.setItem('autoparts_contact_info', JSON.stringify(contactInfo));

      const legacy = readLegacyData();
      expect(legacy).not.toBeNull();
      expect(legacy!.products).toEqual(products);
      expect(legacy!.contactInfo).toEqual(contactInfo);
      expect(legacy!.companyInfo).toBeNull();
    });

    it('should return null when no legacy data exists', () => {
      expect(readLegacyData()).toBeNull();
    });

    it('should clear all legacy keys', () => {
      localStorage.setItem('autoparts_products', '[]');
      localStorage.setItem('autoparts_contact_info', '{}');
      localStorage.setItem('autoparts_company_info', '{}');
      localStorage.setItem('autoparts_data_version', '1');
      localStorage.setItem('autoparts_data_last_modified', '2024-01-01');
      localStorage.setItem('autoparts_hero_slides', '[]');

      clearLegacyData();

      expect(localStorage.getItem('autoparts_products')).toBeNull();
      expect(localStorage.getItem('autoparts_contact_info')).toBeNull();
      expect(localStorage.getItem('autoparts_company_info')).toBeNull();
      expect(localStorage.getItem('autoparts_data_version')).toBeNull();
      expect(localStorage.getItem('autoparts_data_last_modified')).toBeNull();
      expect(localStorage.getItem('autoparts_hero_slides')).toBeNull();
    });
  });

  describe('authentication', () => {
    it('should return false when not authenticated', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true after setAuthToken', () => {
      setAuthToken('test-token-123');
      expect(isAuthenticated()).toBe(true);
      expect(getAuthToken()).toBe('test-token-123');
    });

    it('should return false after clearAuthToken', () => {
      setAuthToken('test-token-123');
      clearAuthToken();
      expect(isAuthenticated()).toBe(false);
      expect(getAuthToken()).toBeNull();
    });

    it('should store token in sessionStorage under ADMIN_AUTH_KEY', () => {
      setAuthToken('my-token');
      expect(sessionStorage.getItem(ADMIN_AUTH_KEY)).toBe('my-token');
    });
  });
});
