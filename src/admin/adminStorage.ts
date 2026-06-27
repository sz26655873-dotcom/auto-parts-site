/**
 * Admin data types, seed defaults, auth helpers, and localStorage cache.
 *
 * Formerly a localStorage CRUD layer, now simplified to provide:
 * - Type definitions (ContactInfo, CompanyInfo, Product, etc.)
 * - Seed default values for offline fallback and data initialization
 * - Auth helpers (sessionStorage token management)
 * - localStorage cache functions (offline fallback for API data)
 *
 * All data I/O is now handled via async API calls in AdminDataContext.
 */

import type { Language } from '../i18n/translations';
import type { LocalizedString, Product } from '../data/products';
import { products as defaultProducts } from '../data/products';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Editable contact information shown in the Contact section. */
export interface ContactInfo {
  /** WhatsApp phone number in international format without "+". */
  whatsapp: string;
  /** Contact email address. */
  email: string;
  /** Contact phone number (display format). */
  phone: string;
  /** Company address localized into 5 languages. */
  address: LocalizedString;
  /** WeChat ID displayed in the QR dialog. */
  wechatId: string;
  /** URL of the WeChat QR code image. */
  wechatQrImage: string;
  /** URL of the WhatsApp QR code image. */
  whatsappQrImage: string;
}

/** A single advantage card (title + description in 5 languages). */
export interface AdvantageInfo {
  title: LocalizedString;
  desc: LocalizedString;
}

/** Editable company information shown in the About and Advantages sections. */
export interface CompanyInfo {
  /** Company display name in 5 languages. */
  name: LocalizedString;
  /** About section heading in 5 languages. */
  title: LocalizedString;
  /** First paragraph of the company description. */
  description1: LocalizedString;
  /** Second paragraph of the company description. */
  description2: LocalizedString;
  /** Four numeric statistics displayed as counters. */
  stats: {
    stat1: string;
    stat2: string;
    stat3: string;
    stat4: string;
  };
  /** Four advantage cards with localized title and description. */
  advantages: {
    oem: AdvantageInfo;
    shipping: AdvantageInfo;
    price: AdvantageInfo;
    exportAdv: AdvantageInfo;
  };
}

/** Full export/import payload. */
export interface AdminDataExport {
  version: number;
  exportedAt: string;
  products: Product[];
  contactInfo: ContactInfo;
  companyInfo: CompanyInfo;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Current data schema version (increment when the shape changes). */
export const CURRENT_DATA_VERSION = 1;

/** sessionStorage key for the admin auth token (server-issued). */
export const ADMIN_AUTH_KEY = 'autoparts_admin_token';

/** localStorage key prefix for offline cache data. */
const CACHE_PREFIX = 'autoparts_cache_';

/** Old localStorage key prefix for legacy data detection. */
const LEGACY_KEYS = [
  'autoparts_products',
  'autoparts_contact_info',
  'autoparts_company_info',
  'autoparts_hero_slides',
  'autoparts_data_version',
  'autoparts_data_last_modified',
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All supported languages in canonical order. */
const ALL_LANGS: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];

/** Creates an empty LocalizedString with all languages set to ''. */
export function emptyLocalizedString(): LocalizedString {
  return ALL_LANGS.reduce((acc, lang) => {
    acc[lang] = '';
    return acc;
  }, {} as LocalizedString);
}

// ---------------------------------------------------------------------------
// Default values (mirrors the current hardcoded site content)
// ---------------------------------------------------------------------------

/** Default contact info — derived from existing hardcoded values. */
export const DEFAULT_CONTACT_INFO: ContactInfo = {
  whatsapp: '8615711970362',
  email: 'sz26655873@gmail.com',
  phone: '+86 157 1197 0362',
  address: {
    en: 'Guangzhou, China',
    zh: '中国广州',
    ru: 'Гуанчжоу, Китай',
    ar: 'غوانزو، الصين',
    ko: '광저우, 중국',
  },
  wechatId: '15711970362',
  wechatQrImage: 'https://picsum.photos/seed/wechatqr/300/300',
  whatsappQrImage: '',
};

/** Default company info — derived from existing translation strings. */
export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: {
    en: 'Altai Auto Parts',
    zh: 'Altai Auto Parts',
    ru: 'Altai Auto Parts',
    ar: 'Altai Auto Parts',
    ko: 'Altai Auto Parts',
  },
  title: emptyLocalizedString(),
  description1: emptyLocalizedString(),
  description2: emptyLocalizedString(),
  stats: {
    stat1: '500K+',
    stat2: '60+',
    stat3: '2,000+',
    stat4: '800+',
  },
  advantages: {
    oem: { title: emptyLocalizedString(), desc: emptyLocalizedString() },
    shipping: { title: emptyLocalizedString(), desc: emptyLocalizedString() },
    price: { title: emptyLocalizedString(), desc: emptyLocalizedString() },
    exportAdv: { title: emptyLocalizedString(), desc: emptyLocalizedString() },
  },
};

/** Default products list — from seed data. */
export const DEFAULT_PRODUCTS: Product[] = defaultProducts;

// ---------------------------------------------------------------------------
// localStorage cache (offline fallback)
// ---------------------------------------------------------------------------

/**
 * Caches data to localStorage with the autoparts_cache_ prefix.
 * Used as offline fallback when API calls fail.
 */
export function cacheToLocalStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // Storage might be full or unavailable — silently ignore.
  }
}

/**
 * Reads cached data from localStorage.
 * Returns null if no cache exists or data is corrupted.
 */
export function getCachedData(key: string): Record<string, unknown> | unknown[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears all localStorage entries with the autoparts_cache_ prefix.
 * Does not affect other localStorage data.
 */
export function clearAllCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

/**
 * Checks whether legacy localStorage data exists (from the old
 * localStorage-based storage system). Returns true if any of the
 * old keys (autoparts_products, etc.) have data.
 */
export function hasLegacyData(): boolean {
  try {
    for (const key of LEGACY_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null && value !== '' && value !== 'null') {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Reads all legacy localStorage data and returns it as a structured
 * object suitable for bulk import via POST /api/data/bulk.
 */
export function readLegacyData(): {
  products: Product[] | null;
  contactInfo: ContactInfo | null;
  companyInfo: CompanyInfo | null;
} | null {
  try {
    const productsRaw = localStorage.getItem('autoparts_products');
    const contactRaw = localStorage.getItem('autoparts_contact_info');
    const companyRaw = localStorage.getItem('autoparts_company_info');

    if (!productsRaw && !contactRaw && !companyRaw) return null;

    return {
      products: productsRaw ? JSON.parse(productsRaw) as Product[] : null,
      contactInfo: contactRaw ? JSON.parse(contactRaw) as ContactInfo : null,
      companyInfo: companyRaw ? JSON.parse(companyRaw) as CompanyInfo : null,
    };
  } catch {
    return null;
  }
}

/**
 * Removes all legacy localStorage keys (autoparts_*).
 * Called after successful data migration to KV.
 */
export function clearLegacyData(): void {
  try {
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Auth helpers (server-side verified)
// ---------------------------------------------------------------------------

/** Returns whether the admin is currently authenticated (has a valid token). */
export function isAuthenticated(): boolean {
  try {
    return !!sessionStorage.getItem(ADMIN_AUTH_KEY);
  } catch {
    return false;
  }
}

/** Returns the auth token for API calls, or null if not authenticated. */
export function getAuthToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY);
  } catch {
    return null;
  }
}

/** Stores the server-issued auth token in sessionStorage. */
export function setAuthToken(token: string): void {
  try {
    sessionStorage.setItem(ADMIN_AUTH_KEY, token);
  } catch {
    // ignore
  }
}

/** Clears the auth token (logout). */
export function clearAuthToken(): void {
  try {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  } catch {
    // ignore
  }
}
