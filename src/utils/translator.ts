/**
 * Translation service utility powered by the MyMemory free translation API.
 *
 * Provides functions to translate single text strings and entire LocalizedString
 * objects between all supported languages (en, zh, ru, ar, ko).
 *
 * API docs: https://mymemory.translated.net/doc/spec.php
 * Free tier: 5000 words/day (anonymous), no API key required.
 */

import type { Language } from '../i18n/translations';
import type { LocalizedString } from '../data/products';

/** All supported languages in canonical order. */
const ALL_LANGUAGES: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];

/** Base URL for the MyMemory translation API endpoint. */
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

/** Delay between successive API requests to avoid rate limiting (milliseconds). */
const REQUEST_DELAY_MS = 300;

/**
 * Pauses execution for the specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait.
 * @returns A promise that resolves after the specified delay.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Translates a single text string from one language to another using the
 * MyMemory translation API.
 *
 * If the input text is empty or contains only whitespace, it is returned
 * as-is without making an API call.
 *
 * @param text - The source text to translate.
 * @param from - The source language code (e.g. 'zh').
 * @param to   - The target language code (e.g. 'en').
 * @returns The translated text, or an empty string if the input was empty.
 * @throws {Error} When the network request fails, the API returns a non-OK
 *   HTTP status, or the API response body indicates an error.
 */
export async function translateText(
  text: string,
  from: Language,
  to: Language,
): Promise<string> {
  // Skip translation for empty or whitespace-only text
  const trimmed = text.trim();
  if (trimmed === '') {
    return '';
  }

  const url =
    `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    throw new Error(
      `Network error during translation: ${
        networkError instanceof Error ? networkError.message : String(networkError)
      }`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Translation API returned HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number | string;
    responseDetails?: string;
  };

  // MyMemory returns responseStatus 200 on success; on failure the
  // responseDetails field contains a human-readable error message.
  const status = data.responseStatus;
  if (status !== undefined && Number(status) !== 200) {
    throw new Error(
      `Translation API error: ${data.responseDetails ?? `status ${status}`}`,
    );
  }

  const translatedText = data.responseData?.translatedText;
  if (!translatedText) {
    throw new Error('Translation API returned no translated text');
  }

  return translatedText;
}

/**
 * Translates a LocalizedString from a source language into one or more target
 * languages. The source language value is never included in the result.
 *
 * Each target language is translated sequentially with a small delay between
 * requests to respect API rate limits. If the source text is empty, all
 * target translations are returned as empty strings without making any API
 * calls.
 *
 * @param source      - The full LocalizedString containing the source text.
 * @param from        - The source language to translate from.
 * @param targetLangs - Optional array of target languages. Defaults to all
 *   supported languages except the source.
 * @returns A partial LocalizedString containing only the translated fields.
 * @throws {Error} When any individual translation request fails. Note that
 *   translations completed before the failure are still included in the
 *   thrown error's partial results are lost; callers should catch the error
 *   and handle it appropriately.
 */
export async function translateLocalizedString(
  source: LocalizedString,
  from: Language,
  targetLangs: Language[] = ALL_LANGUAGES.filter((l) => l !== from),
): Promise<Partial<LocalizedString>> {
  const sourceText = source[from] ?? '';

  // If source text is empty, return empty translations for all targets
  // without making any API calls.
  if (sourceText.trim() === '') {
    const emptyResult: Partial<LocalizedString> = {};
    targetLangs.forEach((lang) => {
      emptyResult[lang] = '';
    });
    return emptyResult;
  }

  const result: Partial<LocalizedString> = {};

  for (let i = 0; i < targetLangs.length; i++) {
    const targetLang = targetLangs[i];

    // Add a delay between requests to avoid API rate limiting,
    // but skip the delay before the first request.
    if (i > 0) {
      await delay(REQUEST_DELAY_MS);
    }

    result[targetLang] = await translateText(sourceText, from, targetLang);
  }

  return result;
}
