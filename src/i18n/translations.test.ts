import { describe, it, expect } from 'vitest';
import {
  translations,
  languageNames,
  RTL_LANGUAGES,
  type Language,
} from './translations';

describe('i18n translations', () => {
  const enKeys = Object.keys(translations.en);
  const zhKeys = Object.keys(translations.zh);
  const ruKeys = Object.keys(translations.ru);
  const arKeys = Object.keys(translations.ar);
  const koKeys = Object.keys(translations.ko);

  const allLangs: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];
  const langKeys: Record<Language, string[]> = {
    en: enKeys,
    zh: zhKeys,
    ru: ruKeys,
    ar: arKeys,
    ko: koKeys,
  };

  describe('language coverage', () => {
    it('should have all 5 languages defined', () => {
      allLangs.forEach((l) => {
        expect(translations[l]).toBeDefined();
        expect(typeof translations[l]).toBe('object');
      });
    });

    it('should have a substantial number of translation keys', () => {
      expect(enKeys.length).toBeGreaterThan(30);
    });
  });

  describe('key parity across all languages', () => {
    it('all languages should have the same number of keys as en', () => {
      allLangs.forEach((l) => {
        expect(langKeys[l].length).toBe(enKeys.length);
      });
    });

    it('every en key should exist in every other language', () => {
      allLangs.forEach((l) => {
        enKeys.forEach((key) => {
          expect(langKeys[l]).toContain(key);
        });
      });
    });
  });

  describe('value completeness', () => {
    allLangs.forEach((l) => {
      it(`no ${l} value should be empty`, () => {
        langKeys[l].forEach((key) => {
          const value = translations[l][key];
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('languageNames and RTL_LANGUAGES', () => {
    it('languageNames should have entries for all 5 languages', () => {
      allLangs.forEach((l) => {
        expect(languageNames[l]).toBeDefined();
        expect(languageNames[l].length).toBeGreaterThan(0);
      });
    });

    it('RTL_LANGUAGES should include only ar', () => {
      expect(RTL_LANGUAGES).toContain('ar');
      expect(RTL_LANGUAGES).not.toContain('en');
      expect(RTL_LANGUAGES).not.toContain('zh');
      expect(RTL_LANGUAGES).not.toContain('ru');
      expect(RTL_LANGUAGES).not.toContain('ko');
    });
  });

  describe('required keys for all 8 sections', () => {
    const requiredKeyPatterns = [
      // Navbar
      /^nav\./,
      // Hero
      /^hero\./,
      // Products
      /^products\./,
      // Advantages
      /^adv\./,
      // About
      /^about\./,
      // Contact
      /^contact\./,
      // WeChat Dialog
      /^wechat\./,
      // Footer
      /^footer\./,
    ];

    requiredKeyPatterns.forEach((pattern) => {
      it(`should have keys matching pattern ${pattern}`, () => {
        const matching = enKeys.filter((k) => pattern.test(k));
        expect(matching.length).toBeGreaterThan(0);
      });
    });
  });

  describe('specific critical keys', () => {
    const criticalKeys = [
      'nav.home',
      'nav.products',
      'nav.about',
      'nav.contact',
      'hero.title',
      'hero.ctaWhatsapp',
      'hero.ctaWechat',
      'products.inquire',
      'products.model',
      'contact.whatsappBtn',
      'contact.wechatBtn',
      'contact.formSubmit',
      'contact.formSuccess',
      'wechat.title',
      'footer.rights',
    ];

    criticalKeys.forEach((key) => {
      it(`should have key "${key}" in all languages`, () => {
        allLangs.forEach((l) => {
          expect(translations[l][key]).toBeDefined();
        });
      });
    });
  });

  describe('translation fallback behavior', () => {
    it('should fall back to the key itself when a key is missing (simulated)', () => {
      function t(lang: Language, key: string): string {
        return translations[lang][key] ?? key;
      }
      expect(t('en', 'nonexistent.key')).toBe('nonexistent.key');
      expect(t('zh', 'nonexistent.key')).toBe('nonexistent.key');
      expect(t('ru', 'nonexistent.key')).toBe('nonexistent.key');
      expect(t('ar', 'nonexistent.key')).toBe('nonexistent.key');
      expect(t('ko', 'nonexistent.key')).toBe('nonexistent.key');
    });

    it('should return the correct value for existing keys', () => {
      function t(lang: Language, key: string): string {
        return translations[lang][key] ?? key;
      }
      expect(t('en', 'nav.home')).toBe('Home');
      expect(t('zh', 'nav.home')).toBe('首页');
      expect(t('ru', 'nav.home')).toBe('Главная');
      expect(t('ar', 'nav.home')).toBe('الرئيسية');
      expect(t('ko', 'nav.home')).toBe('홈');
    });
  });
});
