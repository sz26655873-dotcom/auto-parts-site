import { describe, it, expect } from 'vitest';
import { theme } from './theme';

describe('theme configuration', () => {
  describe('primary color (deep navy)', () => {
    it('should use deep navy blue (#0A2342) as primary main', () => {
      expect(theme.palette.primary.main).toBe('#0A2342');
    });

    it('should have a darker variant', () => {
      expect(theme.palette.primary.dark).toBeDefined();
    });

    it('should have white contrast text', () => {
      expect(theme.palette.primary.contrastText).toBe('#FFFFFF');
    });
  });

  describe('secondary color (orange accent)', () => {
    it('should use vibrant orange (#FF6B00) as secondary main', () => {
      expect(theme.palette.secondary.main).toBe('#FF6B00');
    });

    it('should have a darker variant', () => {
      expect(theme.palette.secondary.dark).toBeDefined();
    });

    it('should have white contrast text', () => {
      expect(theme.palette.secondary.contrastText).toBe('#FFFFFF');
    });
  });

  describe('typography', () => {
    it('should use Inter as the primary font family', () => {
      expect(theme.typography.fontFamily).toContain('Inter');
    });

    it('should not uppercase buttons (textTransform none in typography.button)', () => {
      // textTransform: 'none' is set in typography.button, not in component overrides
      const buttonTypography = theme.typography.button as Record<string, unknown>;
      expect(buttonTypography).toHaveProperty('textTransform', 'none');
    });
  });

  describe('shape', () => {
    it('should use a rounded border radius', () => {
      expect(theme.shape.borderRadius).toBe(8);
    });
  });
});
