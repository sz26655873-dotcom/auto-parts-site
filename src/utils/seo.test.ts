/**
 * Tests for SEO configuration and meta-tag builder utilities.
 *
 * Verifies that buildTitle, buildCanonical, buildProductMetaTitle,
 * and buildProductMetaDescription produce correct SEO output.
 */

import { describe, it, expect } from 'vitest';
import {
  SEO_CONFIG,
  buildTitle,
  buildCanonical,
  buildProductMetaTitle,
  buildProductMetaDescription,
  getProductDisplayDescription,
} from './seo';
import type { Product } from '../data/products';

/** Minimal product fixture for testing. */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    model: 'CHG-2024',
    category: 'engine',
    image: 'https://example.com/img.jpg',
    slug: 'engine-chg-2024',
    name: {
      en: 'Cylinder Head Gasket',
      zh: '气缸盖垫片',
      ru: 'Прокладка ГБЦ',
      ar: 'جوان كتلة',
      ko: '가스켓',
    },
    description: {
      en: 'Premium OEM-grade cylinder head gasket for Toyota engines.',
      zh: '优质OEM级气缸盖垫片',
      ru: 'Прокладка ГБЦ премиум',
      ar: 'جوان متميز',
      ko: '프리미엄 가스켓',
    },
    ...overrides,
  };
}

describe('SEO_CONFIG', () => {
  it('should have a site name', () => {
    expect(SEO_CONFIG.siteName).toBe('Altai Auto Parts');
  });

  it('should have a base URL', () => {
    expect(SEO_CONFIG.baseUrl).toBe('https://www.altai.parts');
  });

  it('should have a default OG image URL', () => {
    expect(SEO_CONFIG.defaultOgImage).toBe('https://www.altai.parts/og-image.png');
  });
});

describe('buildTitle', () => {
  it('should append site name suffix', () => {
    expect(buildTitle('About')).toBe('About | Altai Auto Parts');
  });

  it('should handle empty string', () => {
    expect(buildTitle('')).toBe(' | Altai Auto Parts');
  });

  it('should handle long titles', () => {
    const longTitle = 'A Very Long Product Title That Goes On And On';
    expect(buildTitle(longTitle)).toBe(`${longTitle} | Altai Auto Parts`);
  });
});

describe('buildCanonical', () => {
  it('should build absolute URL from path', () => {
    expect(buildCanonical('/about')).toBe('https://www.altai.parts/about');
  });

  it('should handle root path', () => {
    expect(buildCanonical('/')).toBe('https://www.altai.parts/');
  });

  it('should handle product path', () => {
    expect(buildCanonical('/products/engine-chg-2024')).toBe(
      'https://www.altai.parts/products/engine-chg-2024',
    );
  });

  it('should handle category path', () => {
    expect(buildCanonical('/products/category/engine')).toBe(
      'https://www.altai.parts/products/category/engine',
    );
  });

  it('should handle empty path', () => {
    expect(buildCanonical('')).toBe('https://www.altai.parts');
  });
});

/** Full localized string fixture for tests. */
function ls(en: string, zh = '', ru = '', ar = '', ko = ''): { en: string; zh: string; ru: string; ar: string; ko: string } {
  return { en, zh, ru, ar, ko };
}

describe('buildProductMetaTitle', () => {
  it('should use localized metaTitle (en) when defined', () => {
    const product = makeProduct({ metaTitle: ls('Custom SEO Title', '自定义标题') });
    expect(buildProductMetaTitle(product, 'en')).toBe('Custom SEO Title');
  });

  it('should use localized metaTitle (zh) when defined', () => {
    const product = makeProduct({ metaTitle: ls('Custom SEO Title', '自定义SEO标题') });
    expect(buildProductMetaTitle(product, 'zh')).toBe('自定义SEO标题');
  });

  it('should fall back to .en when requested lang is missing from metaTitle', () => {
    const product = makeProduct({ metaTitle: ls('English Title', '') });
    expect(buildProductMetaTitle(product, 'zh')).toBe('English Title');
  });

  it('should support legacy string metaTitle', () => {
    const product = makeProduct({ metaTitle: 'Legacy String Title' as any });
    expect(buildProductMetaTitle(product)).toBe('Legacy String Title');
  });

  it('should fall back to name + model when metaTitle is absent', () => {
    const product = makeProduct();
    expect(buildProductMetaTitle(product)).toBe('Cylinder Head Gasket CHG-2024');
  });

  it('should fall back to name + model when metaTitle is empty', () => {
    const product = makeProduct({ metaTitle: ls('', '') });
    expect(buildProductMetaTitle(product)).toBe('Cylinder Head Gasket CHG-2024');
  });
});

describe('buildProductMetaDescription', () => {
  it('should use localized metaDescription (en) when defined', () => {
    const product = makeProduct({ metaDescription: ls('Custom SEO description text.', '自定义描述') });
    expect(buildProductMetaDescription(product, 'en')).toBe('Custom SEO description text.');
  });

  it('should use localized metaDescription (zh) when defined', () => {
    const product = makeProduct({ metaDescription: ls('English desc', '中文SEO描述文本。') });
    expect(buildProductMetaDescription(product, 'zh')).toBe('中文SEO描述文本。');
  });

  it('should support legacy string metaDescription', () => {
    const product = makeProduct({ metaDescription: 'Legacy string description.' as any });
    expect(buildProductMetaDescription(product)).toBe('Legacy string description.');
  });

  it('should fall back to English description when metaDescription is absent', () => {
    const product = makeProduct();
    expect(buildProductMetaDescription(product)).toBe(
      'Premium OEM-grade cylinder head gasket for Toyota engines.',
    );
  });

  it('should truncate long descriptions to max 155 characters with ellipsis', () => {
    const longDesc = 'A'.repeat(200);
    const product = makeProduct({ metaDescription: ls(longDesc) });
    const result = buildProductMetaDescription(product);
    expect(result.length).toBeLessThanOrEqual(155);
    expect(result).toBe('A'.repeat(152) + '...');
  });

  it('should not truncate descriptions under 155 characters', () => {
    const shortDesc = 'Short description.';
    const product = makeProduct({ metaDescription: ls(shortDesc) });
    expect(buildProductMetaDescription(product)).toBe(shortDesc);
  });

  it('should not truncate descriptions that are exactly 155 characters', () => {
    const exactDesc = 'A'.repeat(155);
    const product = makeProduct({ metaDescription: ls(exactDesc) });
    expect(buildProductMetaDescription(product)).toBe(exactDesc);
  });

  it('should truncate descriptions of 156 characters', () => {
    const desc = 'A'.repeat(156);
    const product = makeProduct({ metaDescription: ls(desc) });
    const result = buildProductMetaDescription(product);
    expect(result.length).toBe(155);
    expect(result.endsWith('...')).toBe(true);
  });
});

describe('getProductDisplayDescription', () => {
  it('should return localized metaDescription for current lang', () => {
    const product = makeProduct({ metaDescription: ls('English display desc', '中文显示描述') });
    expect(getProductDisplayDescription(product, 'zh')).toBe('中文显示描述');
  });

  it('should fall back to .en when current lang is empty', () => {
    const product = makeProduct({ metaDescription: ls('English fallback', '') });
    expect(getProductDisplayDescription(product, 'zh')).toBe('English fallback');
  });

  it('should fall back to description[lang] when no metaDescription', () => {
    const product = makeProduct();
    expect(getProductDisplayDescription(product, 'zh')).toBe('优质OEM级气缸盖垫片');
  });

  it('should support legacy string metaDescription', () => {
    const product = makeProduct({ metaDescription: 'Legacy string' as any });
    expect(getProductDisplayDescription(product, 'en')).toBe('Legacy string');
  });

  it('should return empty string when nothing available', () => {
    const product = makeProduct({ description: { en: '', zh: '', ru: '', ar: '', ko: '' }});
    expect(getProductDisplayDescription(product, 'en')).toBe('');
  });
});
