/**
 * Tests for the slug generation utility.
 *
 * Verifies that generateSlug produces correct lowercase, hyphen-separated,
 * URL-safe slugs from category and model inputs.
 */

import { describe, it, expect } from 'vitest';
import { generateSlug } from './slug';

describe('generateSlug', () => {
  describe('basic functionality', () => {
    it('should combine category and model with a hyphen', () => {
      expect(generateSlug('engine', 'CHG-2024')).toBe('engine-chg-2024');
    });

    it('should convert uppercase to lowercase', () => {
      expect(generateSlug('Brake', 'BPS-4400')).toBe('brake-bps-4400');
    });

    it('should handle already-lowercase input', () => {
      expect(generateSlug('engine', 'chg-2024')).toBe('engine-chg-2024');
    });
  });

  describe('whitespace handling', () => {
    it('should replace spaces with hyphens', () => {
      expect(generateSlug('engine parts', 'CHG-2024')).toBe('engine-parts-chg-2024');
    });

    it('should replace multiple consecutive spaces with a single hyphen', () => {
      expect(generateSlug('engine   parts', 'CHG-2024')).toBe('engine-parts-chg-2024');
    });

    it('should handle spaces in model field', () => {
      expect(generateSlug('engine', 'CHG 2024')).toBe('engine-chg-2024');
    });

    it('should handle spaces in both fields', () => {
      expect(generateSlug('engine parts', 'CHG 2024')).toBe('engine-parts-chg-2024');
    });
  });

  describe('edge cases', () => {
    it('should handle empty category', () => {
      expect(generateSlug('', 'CHG-2024')).toBe('-chg-2024');
    });

    it('should handle empty model', () => {
      expect(generateSlug('engine', '')).toBe('engine-');
    });

    it('should handle special characters in model (hyphens preserved)', () => {
      expect(generateSlug('engine', 'CHG-2024-V2')).toBe('engine-chg-2024-v2');
    });

    it('should handle numeric category', () => {
      expect(generateSlug('123', 'CHG-2024')).toBe('123-chg-2024');
    });

    it('should handle mixed case input', () => {
      expect(generateSlug('EnGiNe', 'ChG-2024')).toBe('engine-chg-2024');
    });
  });

  describe('real-world product slugs', () => {
    it('should generate correct slug for Cylinder Head Gasket', () => {
      expect(generateSlug('engine', 'CHG-2024')).toBe('engine-chg-2024');
    });

    it('should generate correct slug for Brake Pad Set', () => {
      expect(generateSlug('brake', 'BPS-4400')).toBe('brake-bps-4400');
    });

    it('should generate correct slug for Shock Absorber', () => {
      expect(generateSlug('suspension', 'SA-7700')).toBe('suspension-sa-7700');
    });

    it('should generate correct slug for Alternator', () => {
      expect(generateSlug('electrical', 'ALT-1100')).toBe('electrical-alt-1100');
    });

    it('should generate correct slug for Oil Filter', () => {
      expect(generateSlug('filters', 'OF-6600')).toBe('filters-of-6600');
    });

    it('should generate correct slug for Front Bumper', () => {
      expect(generateSlug('body', 'FB-4400')).toBe('body-fb-4400');
    });
  });

  describe('slug uniqueness property', () => {
    it('should produce different slugs for different models in same category', () => {
      const slug1 = generateSlug('engine', 'CHG-2024');
      const slug2 = generateSlug('engine', 'PRS-1850');
      expect(slug1).not.toBe(slug2);
    });

    it('should produce different slugs for same model in different categories', () => {
      const slug1 = generateSlug('engine', 'TEST-001');
      const slug2 = generateSlug('brake', 'TEST-001');
      expect(slug1).not.toBe(slug2);
    });
  });
});
