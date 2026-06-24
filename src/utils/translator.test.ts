import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translateText, translateLocalizedString } from './translator';
import type { LocalizedString } from '../data/products';

/**
 * Creates a mock Response object that mimics the fetch Response interface
 * for a successful MyMemory API call.
 */
function mockOkResponse(translatedText: string, responseStatus: number = 200): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      responseData: { translatedText },
      responseStatus,
    }),
  } as unknown as Response;
}

/**
 * Creates a mock Response object for a failed HTTP request.
 */
function mockHttpErrorResponse(status: number, statusText: string): Response {
  return {
    ok: false,
    status,
    statusText,
    json: async () => ({}),
  } as unknown as Response;
}

/**
 * Creates a mock Response object for a MyMemory API-level error
 * (HTTP 200 but responseStatus != 200).
 */
function mockApiErrorResponse(responseStatus: number, responseDetails: string): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      responseData: { translatedText: '' },
      responseStatus,
      responseDetails,
    }),
  } as unknown as Response;
}

describe('translator utility', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('translateText', () => {
    it('should return the translated text on a successful API call', async () => {
      fetchMock.mockResolvedValue(mockOkResponse('Hello'));

      const result = await translateText('你好', 'zh', 'en');

      expect(result).toBe('Hello');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should construct the correct API URL with encoded text and langpair', async () => {
      fetchMock.mockResolvedValue(mockOkResponse('Hello'));

      await translateText('Brake Pad Set', 'en', 'ru');

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain('https://api.mymemory.translated.net/get');
      expect(calledUrl).toContain('q=');
      expect(calledUrl).toContain(encodeURIComponent('Brake Pad Set'));
      expect(calledUrl).toContain('langpair=en|ru');
    });

    it('should return an empty string without calling the API for empty text', async () => {
      const result = await translateText('', 'zh', 'en');

      expect(result).toBe('');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should return an empty string without calling the API for whitespace-only text', async () => {
      const result = await translateText('   \n\t  ', 'zh', 'en');

      expect(result).toBe('');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should throw an error when the API returns a non-OK HTTP status', async () => {
      fetchMock.mockResolvedValue(mockHttpErrorResponse(500, 'Internal Server Error'));

      await expect(translateText('hello', 'en', 'zh')).rejects.toThrow(
        /HTTP 500/,
      );
    });

    it('should throw an error when the API response status is not 200', async () => {
      fetchMock.mockResolvedValue(
        mockApiErrorResponse(403, 'PLEASE SELECT TWO DISTINCT LANGUAGES'),
      );

      await expect(translateText('hello', 'en', 'en')).rejects.toThrow(
        /PLEASE SELECT TWO DISTINCT LANGUAGES/,
      );
    });

    it('should throw an error when responseData.translatedText is missing', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ responseData: {}, responseStatus: 200 }),
      } as unknown as Response);

      await expect(translateText('hello', 'en', 'zh')).rejects.toThrow(
        /no translated text/,
      );
    });

    it('should throw a network error when fetch rejects', async () => {
      fetchMock.mockRejectedValue(new Error('Failed to connect'));

      await expect(translateText('hello', 'en', 'zh')).rejects.toThrow(
        /Network error/,
      );
    });

    it('should throw a network error when fetch throws a non-Error value', async () => {
      fetchMock.mockImplementation(() => {
        throw 'string error';
      });

      await expect(translateText('hello', 'en', 'zh')).rejects.toThrow(
        /Network error/,
      );
    });

    it('should handle non-string responseStatus values gracefully', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          responseData: { translatedText: '' },
          responseStatus: '429',
          responseDetails: 'Rate limit exceeded',
        }),
      } as unknown as Response);

      await expect(translateText('hello', 'en', 'zh')).rejects.toThrow(
        /Rate limit exceeded/,
      );
    });
  });

  describe('translateLocalizedString', () => {
    it('should translate to all target languages except the source', async () => {
      // Return different translations based on the target language in the URL
      fetchMock.mockImplementation((url: string) => {
        const langpairMatch = url.match(/langpair=([^&]+)/);
        const langpair = langpairMatch ? decodeURIComponent(langpairMatch[1]) : '';
        const to = langpair.split('|')[1] ?? '';
        return Promise.resolve(mockOkResponse(`translated-to-${to}`));
      });

      const source: LocalizedString = {
        en: 'hello',
        zh: '',
        ru: '',
        ar: '',
        ko: '',
      };

      const result = await translateLocalizedString(source, 'en');

      expect(result.zh).toBe('translated-to-zh');
      expect(result.ru).toBe('translated-to-ru');
      expect(result.ar).toBe('translated-to-ar');
      expect(result.ko).toBe('translated-to-ko');
      // Source language should NOT be in the result
      expect(result.en).toBeUndefined();
      // Should make exactly 4 API calls (one per target language)
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it('should exclude the source language from translations by default', async () => {
      fetchMock.mockResolvedValue(mockOkResponse('translated'));

      const source: LocalizedString = {
        en: '',
        zh: '你好',
        ru: '',
        ar: '',
        ko: '',
      };

      const result = await translateLocalizedString(source, 'zh');

      const translatedKeys = Object.keys(result);
      expect(translatedKeys).not.toContain('zh');
      expect(translatedKeys).toContain('en');
      expect(translatedKeys).toContain('ru');
      expect(translatedKeys).toContain('ar');
      expect(translatedKeys).toContain('ko');
    });

    it('should translate to only the specified target languages', async () => {
      fetchMock.mockResolvedValue(mockOkResponse('translated'));

      const source: LocalizedString = {
        en: 'hello',
        zh: '',
        ru: '',
        ar: '',
        ko: '',
      };

      const result = await translateLocalizedString(source, 'en', ['zh', 'ru']);

      expect(Object.keys(result)).toEqual(['zh', 'ru']);
      expect(result.zh).toBe('translated');
      expect(result.ru).toBe('translated');
      expect(result.ar).toBeUndefined();
      expect(result.ko).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should return empty strings for all targets without API calls when source is empty', async () => {
      const source: LocalizedString = {
        en: '',
        zh: '',
        ru: '',
        ar: '',
        ko: '',
      };

      const result = await translateLocalizedString(source, 'zh');

      expect(result.en).toBe('');
      expect(result.ru).toBe('');
      expect(result.ar).toBe('');
      expect(result.ko).toBe('');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should return empty strings for all targets without API calls when source is whitespace-only', async () => {
      const source: LocalizedString = {
        en: '   ',
        zh: '',
        ru: '',
        ar: '',
        ko: '',
      };

      const result = await translateLocalizedString(source, 'en');

      expect(result.zh).toBe('');
      expect(result.ru).toBe('');
      expect(result.ar).toBe('');
      expect(result.ko).toBe('');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should propagate errors from translateText when a translation fails', async () => {
      fetchMock.mockResolvedValue(mockHttpErrorResponse(503, 'Service Unavailable'));

      const source: LocalizedString = {
        en: 'hello',
        zh: '',
        ru: '',
        ar: '',
        ko: '',
      };

      await expect(translateLocalizedString(source, 'en')).rejects.toThrow(
        /HTTP 503/,
      );
    });

    it('should add a delay between consecutive API requests', async () => {
      fetchMock.mockResolvedValue(mockOkResponse('translated'));

      const source: LocalizedString = {
        en: 'hello',
        zh: '',
        ru: '',
        ar: '',
        ko: '',
      };

      const startTime = Date.now();
      await translateLocalizedString(source, 'en', ['zh', 'ru']);
      const elapsed = Date.now() - startTime;

      // With 2 target languages, there should be 1 delay of ~300ms.
      // Allow some tolerance for timer scheduling.
      expect(elapsed).toBeGreaterThanOrEqual(280);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should handle a single target language without any delay', async () => {
      fetchMock.mockResolvedValue(mockOkResponse('translated'));

      const source: LocalizedString = {
        en: 'hello',
        zh: '',
        ru: '',
        ar: '',
        ko: '',
      };

      const startTime = Date.now();
      const result = await translateLocalizedString(source, 'en', ['zh']);
      const elapsed = Date.now() - startTime;

      expect(result.zh).toBe('translated');
      // A single target should complete almost instantly (no delay needed)
      expect(elapsed).toBeLessThan(100);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
