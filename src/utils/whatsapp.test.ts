import { describe, it, expect } from 'vitest';
import {
  buildWhatsAppLink,
  buildWhatsAppLinkForLang,
  buildProductInquiryLink,
  WHATSAPP_PHONE,
  WHATSAPP_DEFAULT_MESSAGE,
} from './whatsapp';
import type { Language } from '../i18n/translations';

const allLangs: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];

describe('whatsapp utility', () => {
  describe('WHATSAPP_PHONE constant', () => {
    it('should be the expected international format without "+"', () => {
      expect(WHATSAPP_PHONE).toBe('8613800138000');
    });

    it('should contain only digits', () => {
      expect(WHATSAPP_PHONE).toMatch(/^\d+$/);
    });
  });

  describe('buildWhatsAppLink', () => {
    it('should build a wa.me URL with the correct phone number when no message is given', () => {
      const link = buildWhatsAppLink();
      expect(link).toBe(
        `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`,
      );
    });

    it('should start with https://wa.me/', () => {
      const link = buildWhatsAppLink();
      expect(link.startsWith('https://wa.me/')).toBe(true);
    });

    it('should include the phone number in the URL', () => {
      const link = buildWhatsAppLink();
      expect(link).toContain(`wa.me/${WHATSAPP_PHONE}`);
    });

    it('should include the text query parameter', () => {
      const link = buildWhatsAppLink();
      expect(link).toContain('?text=');
    });

    it('should URL-encode the default message', () => {
      const link = buildWhatsAppLink();
      const expectedText = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);
      expect(link).toBe(`https://wa.me/${WHATSAPP_PHONE}?text=${expectedText}`);
    });

    it('should use a custom message when provided', () => {
      const custom = 'Custom inquiry message';
      const link = buildWhatsAppLink(custom);
      expect(link).toBe(
        `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(custom)}`,
      );
    });

    it('should URL-encode special characters in the message', () => {
      const message = 'Hello! How much is it? (brake pad)';
      const link = buildWhatsAppLink(message);
      expect(link).toContain(encodeURIComponent(message));
      // spaces should be encoded as %20
      expect(link).not.toContain(' ');
    });

    it('should encode newlines in multi-line messages', () => {
      const message = 'Line 1\nLine 2';
      const link = buildWhatsAppLink(message);
      expect(link).toContain('%0A'); // encoded newline
      expect(link).not.toContain('\n');
    });
  });

  describe('buildWhatsAppLinkForLang', () => {
    it('should produce a valid wa.me URL for every language', () => {
      allLangs.forEach((l) => {
        const link = buildWhatsAppLinkForLang(l);
        expect(link).toMatch(/^https:\/\/wa\.me\/\d+\?text=.+$/);
      });
    });

    it('should include the phone number for every language', () => {
      allLangs.forEach((l) => {
        const link = buildWhatsAppLinkForLang(l);
        expect(link).toContain(`wa.me/${WHATSAPP_PHONE}`);
      });
    });

    it('should produce different encoded text for different languages', () => {
      const enLink = buildWhatsAppLinkForLang('en');
      const zhLink = buildWhatsAppLinkForLang('zh');
      expect(enLink).not.toBe(zhLink);
    });
  });

  describe('buildProductInquiryLink', () => {
    it('should build a wa.me URL containing the product name', () => {
      const link = buildProductInquiryLink('Brake Pad Set', 'BPS-4400', 'en');
      const decoded = decodeURIComponent(link.split('?text=')[1]);
      expect(decoded).toContain('Brake Pad Set');
    });

    it('should build a wa.me URL containing the product model', () => {
      const link = buildProductInquiryLink('Brake Pad Set', 'BPS-4400', 'en');
      const decoded = decodeURIComponent(link.split('?text=')[1]);
      expect(decoded).toContain('BPS-4400');
    });

    it('should include both product name and model in the message', () => {
      const link = buildProductInquiryLink('Oil Filter', 'OF-6600', 'en');
      const decoded = decodeURIComponent(link.split('?text=')[1]);
      expect(decoded).toContain('Oil Filter');
      expect(decoded).toContain('OF-6600');
    });

    it('should produce a valid wa.me URL format', () => {
      const link = buildProductInquiryLink('Test Product', 'TP-001', 'en');
      expect(link).toMatch(/^https:\/\/wa\.me\/\d+\?text=.+$/);
    });

    it('should use the configured phone number', () => {
      const link = buildProductInquiryLink('Test Product', 'TP-001', 'en');
      expect(link).toContain(`wa.me/${WHATSAPP_PHONE}`);
    });

    it('should handle product names with special characters', () => {
      const link = buildProductInquiryLink('Cylinder Head Gasket (OEM)', 'CHG-2024', 'en');
      const decoded = decodeURIComponent(link.split('?text=')[1]);
      expect(decoded).toContain('Cylinder Head Gasket (OEM)');
      // URL should not contain raw spaces in the text param (encoded as %20)
      const textParam = link.split('?text=')[1];
      expect(textParam).not.toContain(' ');
      // The decoded message should round-trip correctly
      expect(decoded).toContain('CHG-2024');
    });

    it('should produce localized messages for each language', () => {
      allLangs.forEach((l) => {
        const link = buildProductInquiryLink('Test Product', 'TP-001', l);
        const decoded = decodeURIComponent(link.split('?text=')[1]);
        expect(decoded).toContain('Test Product');
        expect(decoded).toContain('TP-001');
      });
    });
  });
});
