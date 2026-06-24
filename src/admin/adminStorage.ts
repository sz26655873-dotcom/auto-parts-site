/**
 * localStorage persistence layer for the Admin backend.
 *
 * All editable site data (products, contact info, company info) is stored
 * in localStorage so that admin changes persist across page reloads.
 * When localStorage is empty or corrupted, the code falls back to the
 * default seed data defined in products.ts and translations.ts.
 *
 * SECURITY NOTE: This is a pure front-end project. The admin password and
 * all data are stored client-side. For production use with higher security
 * requirements, migrate to a backend API with proper authentication.
 */

import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
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

/** localStorage keys for each data section. */
const STORAGE_KEYS = {
  products: 'autoparts_products',
  contactInfo: 'autoparts_contact_info',
  companyInfo: 'autoparts_company_info',
  version: 'autoparts_data_version',
  lastModified: 'autoparts_data_last_modified',
} as const;

/** Current data schema version (increment when the shape changes). */
export const CURRENT_DATA_VERSION = 1;

/** Admin password (hardcoded — see SECURITY NOTE above). */
export const ADMIN_PASSWORD = 'admin2024';

/** sessionStorage key for the admin authentication flag. */
export const ADMIN_AUTH_KEY = 'autoparts_admin_auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All supported languages in canonical order. */
const ALL_LANGS: Language[] = ['en', 'zh', 'ru', 'ar', 'ko'];

/**
 * Builds a LocalizedString from a translation key by looking up
 * the value in every supported language.
 */
function localizedFromTranslationKey(key: string): LocalizedString {
  return ALL_LANGS.reduce((acc, lang) => {
    acc[lang] = translations[lang][key] ?? key;
    return acc;
  }, {} as LocalizedString);
}

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
  whatsapp: '8613800138000',
  email: 'sales@autoparts-export.com',
  phone: '+86 138 0013 8000',
  address: localizedFromTranslationKey('contact.addressValue'),
  wechatId: 'AutoPartsExport',
  wechatQrImage: 'https://picsum.photos/seed/wechatqr/300/300',
};

/** Default company info — derived from existing translation strings. */
export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: {
    en: 'AutoParts Export',
    zh: 'AutoParts Export',
    ru: 'AutoParts Export',
    ar: 'AutoParts Export',
    ko: 'AutoParts Export',
  },
  title: localizedFromTranslationKey('about.title'),
  description1: localizedFromTranslationKey('about.desc1'),
  description2: localizedFromTranslationKey('about.desc2'),
  stats: {
    stat1: '500K+',
    stat2: '60+',
    stat3: '2,000+',
    stat4: '800+',
  },
  advantages: {
    oem: {
      title: localizedFromTranslationKey('adv.oem.title'),
      desc: localizedFromTranslationKey('adv.oem.desc'),
    },
    shipping: {
      title: localizedFromTranslationKey('adv.shipping.title'),
      desc: localizedFromTranslationKey('adv.shipping.desc'),
    },
    price: {
      title: localizedFromTranslationKey('adv.price.title'),
      desc: localizedFromTranslationKey('adv.price.desc'),
    },
    exportAdv: {
      title: localizedFromTranslationKey('adv.export.title'),
      desc: localizedFromTranslationKey('adv.export.desc'),
    },
  },
};

// ---------------------------------------------------------------------------
// Generic localStorage read/write helpers
// ---------------------------------------------------------------------------

/** Safely reads and parses a JSON value from localStorage. */
function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Serialises and writes a value to localStorage. */
function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    updateLastModified();
  } catch {
    // Storage might be full or unavailable — silently ignore.
  }
}

/** Updates the last-modified timestamp. */
function updateLastModified(): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.lastModified,
      new Date().toISOString(),
    );
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/** Returns the stored products, or the default seed data if none exist. */
export function getProducts(): Product[] {
  const stored = readJSON<Product[]>(STORAGE_KEYS.products);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  return defaultProducts;
}

/** Persists the products array to localStorage. */
export function setProducts(products: Product[]): void {
  writeJSON(STORAGE_KEYS.products, products);
}

// ---------------------------------------------------------------------------
// Contact Info
// ---------------------------------------------------------------------------

/** Returns the stored contact info, or defaults if none exists. */
export function getContactInfo(): ContactInfo {
  const stored = readJSON<Partial<ContactInfo>>(STORAGE_KEYS.contactInfo);
  if (stored) {
    // Merge with defaults so new fields are always present.
    return { ...DEFAULT_CONTACT_INFO, ...stored };
  }
  return DEFAULT_CONTACT_INFO;
}

/** Persists the contact info to localStorage. */
export function setContactInfo(info: ContactInfo): void {
  writeJSON(STORAGE_KEYS.contactInfo, info);
}

// ---------------------------------------------------------------------------
// Company Info
// ---------------------------------------------------------------------------

/** Returns the stored company info, or defaults if none exists. */
export function getCompanyInfo(): CompanyInfo {
  const stored = readJSON<Partial<CompanyInfo>>(STORAGE_KEYS.companyInfo);
  if (stored) {
    // Deep-merge with defaults to ensure all nested fields exist.
    return {
      ...DEFAULT_COMPANY_INFO,
      ...stored,
      stats: { ...DEFAULT_COMPANY_INFO.stats, ...(stored.stats ?? {}) },
      advantages: {
        oem: { ...DEFAULT_COMPANY_INFO.advantages.oem, ...(stored.advantages?.oem ?? {}) },
        shipping: { ...DEFAULT_COMPANY_INFO.advantages.shipping, ...(stored.advantages?.shipping ?? {}) },
        price: { ...DEFAULT_COMPANY_INFO.advantages.price, ...(stored.advantages?.price ?? {}) },
        exportAdv: { ...DEFAULT_COMPANY_INFO.advantages.exportAdv, ...(stored.advantages?.exportAdv ?? {}) },
      },
    };
  }
  return DEFAULT_COMPANY_INFO;
}

/** Persists the company info to localStorage. */
export function setCompanyInfo(info: CompanyInfo): void {
  writeJSON(STORAGE_KEYS.companyInfo, info);
}

// ---------------------------------------------------------------------------
// Version & metadata
// ---------------------------------------------------------------------------

/** Returns the stored data schema version, or the current version. */
export function getDataVersion(): number {
  const stored = readJSON<number>(STORAGE_KEYS.version);
  return typeof stored === 'number' ? stored : CURRENT_DATA_VERSION;
}

/** Returns the ISO timestamp of the last data modification. */
export function getLastModified(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.lastModified);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Export / Import / Reset
// ---------------------------------------------------------------------------

/** Builds a complete JSON export payload of all admin data. */
export function exportData(): string {
  const payload: AdminDataExport = {
    version: CURRENT_DATA_VERSION,
    exportedAt: new Date().toISOString(),
    products: getProducts(),
    contactInfo: getContactInfo(),
    companyInfo: getCompanyInfo(),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Imports admin data from a JSON string.
 * Validates the basic structure before writing.
 *
 * @returns `true` on success, `false` if the JSON is invalid.
 */
export function importData(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Partial<AdminDataExport>;
    if (
      !parsed ||
      !Array.isArray(parsed.products) ||
      typeof parsed.contactInfo !== 'object' ||
      typeof parsed.companyInfo !== 'object'
    ) {
      return false;
    }
    setProducts(parsed.products as Product[]);
    setContactInfo({ ...DEFAULT_CONTACT_INFO, ...parsed.contactInfo });
    setCompanyInfo({ ...DEFAULT_COMPANY_INFO, ...parsed.companyInfo } as CompanyInfo);
    try {
      localStorage.setItem(
        STORAGE_KEYS.version,
        String(parsed.version ?? CURRENT_DATA_VERSION),
      );
    } catch {
      // ignore
    }
    updateLastModified();
    return true;
  } catch {
    return false;
  }
}

/** Removes all admin data from localStorage, reverting to code defaults. */
export function resetData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.products);
    localStorage.removeItem(STORAGE_KEYS.contactInfo);
    localStorage.removeItem(STORAGE_KEYS.companyInfo);
    localStorage.removeItem(STORAGE_KEYS.version);
    localStorage.removeItem(STORAGE_KEYS.lastModified);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/** Returns whether the admin is currently authenticated. */
export function isAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Sets the authenticated flag in sessionStorage. */
export function setAuthenticated(value: boolean): void {
  try {
    if (value) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch {
    // ignore
  }
}
