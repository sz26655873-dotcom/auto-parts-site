/**
 * Tests for adminStorage backward compatibility — verifies that the
 * localStorage cache functions correctly handle products with SEO fields
 * (slug, featured, images) that may be missing from older data.
 *
 * These tests verify the cache layer (cacheToLocalStorage / getCachedData)
 * rather than the old synchronous getProducts/setProducts which have been
 * removed in the KV migration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheToLocalStorage, getCachedData, clearAllCache } from './adminStorage';

/**
 * In-memory localStorage mock.
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

/** Minimal old-schema product (no slug, no featured, no images). */
function makeOldProduct() {
  return {
    id: 100,
    model: 'OLD-001',
    category: 'engine',
    image: 'https://example.com/old.jpg',
    name: { en: 'Old Product', zh: '旧产品', ru: 'Старый', ar: 'قديم', ko: '구제품' },
    description: { en: 'Old desc', zh: '旧描述', ru: 'Старый', ar: 'قديم', ko: '구제품' },
  };
}

describe('adminStorage backward compatibility (cache layer)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new StorageMock());
  });

  describe('cache round-trip for products', () => {
    it('should cache and retrieve old-schema products without modification', () => {
      const oldProduct = makeOldProduct();
      cacheToLocalStorage('products', [oldProduct]);
      const result = getCachedData('products') as any[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(100);
      expect(result[0].model).toBe('OLD-001');
    });

    it('should cache and retrieve new-schema products preserving all fields', () => {
      const newProduct = {
        ...makeOldProduct(),
        slug: 'custom-new-slug',
        featured: true,
        images: ['new-img1.jpg', 'new-img2.jpg'],
        oemNumber: 'OEM-12345',
      };
      cacheToLocalStorage('products', [newProduct]);
      const result = getCachedData('products') as any[];
      expect(result[0].slug).toBe('custom-new-slug');
      expect(result[0].featured).toBe(true);
      expect(result[0].images).toEqual(['new-img1.jpg', 'new-img2.jpg']);
      expect(result[0].oemNumber).toBe('OEM-12345');
    });

    it('should cache and retrieve a mix of old and new schema products', () => {
      const oldProduct = makeOldProduct();
      const newProduct = {
        ...makeOldProduct(),
        id: 101,
        slug: 'custom-new-slug',
        featured: true,
        images: ['new-img1.jpg', 'new-img2.jpg'],
      };
      cacheToLocalStorage('products', [oldProduct, newProduct]);
      const result = getCachedData('products') as any[];
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(100);
      expect(result[1].slug).toBe('custom-new-slug');
      expect(result[1].featured).toBe(true);
    });
  });

  describe('cache for contact_info and company_info', () => {
    it('should cache and retrieve contact info', () => {
      const contactInfo = {
        whatsapp: '1234567890',
        email: 'custom@test.com',
        phone: '+1 234 567 890',
        address: { en: 'Test City', zh: '测试城', ru: 'Тест', ar: 'اختبار', ko: '테스트' },
        wechatId: 'testwechat',
        wechatQrImage: '',
        whatsappQrImage: '',
      };
      cacheToLocalStorage('contact_info', contactInfo);
      const result = getCachedData('contact_info');
      expect(result).toEqual(contactInfo);
    });

    it('should cache and retrieve company info', () => {
      const companyInfo = {
        name: { en: 'Test Company', zh: '测试公司', ru: 'Тест', ar: 'اختبار', ko: '테스트' },
        stats: { stat1: '1M+', stat2: '50+', stat3: '1,000+', stat4: '500+' },
      };
      cacheToLocalStorage('company_info', companyInfo);
      const result = getCachedData('company_info');
      expect(result).toEqual(companyInfo);
    });
  });

  describe('cache isolation', () => {
    it('should not mix up cache keys', () => {
      cacheToLocalStorage('products', [{ id: 1 }]);
      cacheToLocalStorage('contact_info', { whatsapp: 'test' });
      const products = getCachedData('products');
      const contact = getCachedData('contact_info');
      expect(products).toEqual([{ id: 1 }]);
      expect(contact).toEqual({ whatsapp: 'test' });
    });

    it('should clear only cache entries with clearAllCache', () => {
      cacheToLocalStorage('products', [{ id: 1 }]);
      cacheToLocalStorage('contact_info', { test: true });
      localStorage.setItem('other_key', 'preserved');
      clearAllCache();
      expect(getCachedData('products')).toBeNull();
      expect(getCachedData('contact_info')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('preserved');
    });
  });
});
