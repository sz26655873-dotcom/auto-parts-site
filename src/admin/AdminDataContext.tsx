/**
 * AdminDataContext — central async data provider for the entire application.
 *
 * Wraps both the front-end site and the admin backend. Fetches products,
 * contact info, and company info from Cloudflare KV via API on mount.
 * Falls back to localStorage cache when API fails, and to seed defaults
 * when both fail. All setters persist to KV via async PUT calls and
 * update React state on success.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Product, LocalizedString } from '../data/products';
import { emptyLocalizedString } from './adminStorage';
import {
  type ContactInfo,
  type CompanyInfo,
  type AdminDataExport,
  DEFAULT_PRODUCTS,
  DEFAULT_CONTACT_INFO,
  DEFAULT_COMPANY_INFO,
  CURRENT_DATA_VERSION,
  cacheToLocalStorage,
  getCachedData,
  clearAllCache,
  hasLegacyData,
  readLegacyData,
  clearLegacyData,
  getAuthToken,
} from './adminStorage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Network connectivity status. */
type NetworkStatus = 'online' | 'offline' | 'syncing';

/** Context value exposed to consumers via `useAdminData()`. */
interface AdminDataContextValue {
  /** Current product catalog (from API, cache, or defaults). */
  products: Product[];
  /** Current contact information. */
  contactInfo: ContactInfo;
  /** Current company information. */
  companyInfo: CompanyInfo;
  /** Data schema version. */
  dataVersion: number;
  /** ISO timestamp of the last data modification (or null). */
  lastModified: string | null;
  /** Whether data is currently loading from API. */
  loading: boolean;
  /** Error message if data fetch failed. */
  error: string | null;
  /** Current network connectivity status. */
  networkStatus: NetworkStatus;

  /** Replaces the entire product catalog and persists to KV. */
  updateProducts: (products: Product[]) => Promise<void>;
  /** Updates contact information and persists to KV. */
  updateContactInfo: (info: ContactInfo) => Promise<void>;
  /** Updates company information and persists to KV. */
  updateCompanyInfo: (info: CompanyInfo) => Promise<void>;

  /** Returns a JSON string of all admin data for download. */
  exportAllData: () => Promise<string>;
  /** Imports admin data from a JSON string. Returns success boolean. */
  importAllData: (json: string) => Promise<boolean>;
  /** Resets all admin data to seed defaults via KV. */
  resetAllData: () => Promise<void>;
  /** Reloads all data from API into React state. */
  refreshData: () => Promise<void>;

  /** Whether legacy localStorage data exists (for migration UI). */
  hasLegacyLocalStorageData: boolean;
  /** Migrates legacy localStorage data to KV. Returns success boolean. */
  migrateLegacyData: () => Promise<boolean>;
}

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

interface AdminDataProviderProps {
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/** Fetches a data key from the API. Returns parsed JSON or null on error. */
async function fetchFromApi<T>(key: string): Promise<{ data: T; lastModified: string } | null> {
  try {
    const url = `/api/data/${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return { data: json.data as T, lastModified: json.lastModified as string };
  } catch {
    return null;
  }
}

/** Writes a data key to KV via PUT API. Requires auth token. */
async function putToApi(key: string, value: any): Promise<{ lastModified: string } | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`/api/data/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return { lastModified: json.lastModified as string };
  } catch (err: any) {
    throw err;
  }
}

/** Posts bulk data to KV. Requires auth token. */
async function postBulkToApi(dataMap: Record<string, any>): Promise<{ lastModified: string } | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/data/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataMap),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return { lastModified: json.lastModified as string };
  } catch (err: any) {
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Provides admin-managed data to the entire app.
 * Fetches from API on mount with localStorage cache fallback.
 */
export function AdminDataProvider({ children }: AdminDataProviderProps): JSX.Element {
  const [products, setProductsState] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [contactInfo, setContactInfoState] = useState<ContactInfo>(DEFAULT_CONTACT_INFO);
  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);
  const [dataVersion, setDataVersion] = useState<number>(CURRENT_DATA_VERSION);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('syncing');
  const [hasLegacyLocalStorageData, setHasLegacyLocalStorageData] = useState<boolean>(false);

  // Check for legacy data on mount
  useEffect(() => {
    setHasLegacyLocalStorageData(hasLegacyData());
  }, []);

  /** Fetches all 3 data types from API concurrently. */
  const fetchAllData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setNetworkStatus('syncing');

    try {
      const [productsResult, contactResult, companyResult] = await Promise.all([
        fetchFromApi<Product[]>('products'),
        fetchFromApi<ContactInfo>('contact_info'),
        fetchFromApi<CompanyInfo>('company_info'),
      ]);

      // Process products — API success or fallback
      if (productsResult) {
        /** Migrates legacy string metaTitle/metaDescription to LocalizedString. */
        const toLocalized = (val: any): LocalizedString | undefined => {
          if (!val) return undefined;
          if (typeof val === 'object' && !Array.isArray(val)) return val as LocalizedString;
          if (typeof val === 'string' && val) {
            const ls = emptyLocalizedString();
            ls.en = val;
            return ls;
          }
          return undefined;
        };

        const normalizedProducts = productsResult.data.map((p, i): Product => ({
          ...p,
          featured: p.featured ?? true,
          sortOrder: p.sortOrder ?? i,
          metaTitle: toLocalized(p.metaTitle),
          metaDescription: toLocalized(p.metaDescription),
          images: (() => {
            const main = p.image;
            const extras = (p.images || []).filter((img) => img && img !== main);
            return [main, ...extras];
          })(),
        }));
        setProductsState(normalizedProducts);
        cacheToLocalStorage('products', normalizedProducts);
      } else {
        // Fallback: localStorage cache, then defaults
        const cached = getCachedData('products') as Product[] | null;
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setProductsState(cached);
        }
        // else: keep DEFAULT_PRODUCTS (already set as initial state)
      }

      // Process contact info
      if (contactResult) {
        setContactInfoState({ ...DEFAULT_CONTACT_INFO, ...contactResult.data });
        cacheToLocalStorage('contact_info', contactResult.data);
      } else {
        const cached = getCachedData('contact_info') as ContactInfo | null;
        if (cached) {
          setContactInfoState({ ...DEFAULT_CONTACT_INFO, ...cached });
        }
      }

      // Process company info
      if (companyResult) {
        setCompanyInfoState({
          ...DEFAULT_COMPANY_INFO,
          ...companyResult.data,
          stats: { ...DEFAULT_COMPANY_INFO.stats, ...(companyResult.data.stats ?? {}) },
          advantages: {
            oem: { ...DEFAULT_COMPANY_INFO.advantages.oem, ...(companyResult.data.advantages?.oem ?? {}) },
            shipping: { ...DEFAULT_COMPANY_INFO.advantages.shipping, ...(companyResult.data.advantages?.shipping ?? {}) },
            price: { ...DEFAULT_COMPANY_INFO.advantages.price, ...(companyResult.data.advantages?.price ?? {}) },
            exportAdv: { ...DEFAULT_COMPANY_INFO.advantages.exportAdv, ...(companyResult.data.advantages?.exportAdv ?? {}) },
          },
        });
        cacheToLocalStorage('company_info', companyResult.data);
      } else {
        const cached = getCachedData('company_info') as CompanyInfo | null;
        if (cached) {
          setCompanyInfoState({
            ...DEFAULT_COMPANY_INFO,
            ...cached,
            stats: { ...DEFAULT_COMPANY_INFO.stats, ...(cached.stats ?? {}) },
            advantages: {
              oem: { ...DEFAULT_COMPANY_INFO.advantages.oem, ...(cached.advantages?.oem ?? {}) },
              shipping: { ...DEFAULT_COMPANY_INFO.advantages.shipping, ...(cached.advantages?.shipping ?? {}) },
              price: { ...DEFAULT_COMPANY_INFO.advantages.price, ...(cached.advantages?.price ?? {}) },
              exportAdv: { ...DEFAULT_COMPANY_INFO.advantages.exportAdv, ...(cached.advantages?.exportAdv ?? {}) },
            },
          });
        }
      }

      // Update lastModified from any successful result
      const lm = productsResult?.lastModified || contactResult?.lastModified || companyResult?.lastModified;
      if (lm) setLastModified(lm);

      // Set network status based on overall success
      const anySuccess = productsResult || contactResult || companyResult;
      const allSuccess = productsResult && contactResult && companyResult;
      if (allSuccess) {
        setNetworkStatus('online');
        setError(null);
      } else if (anySuccess) {
        setNetworkStatus('online');
        setError('部分数据加载失败，已使用缓存或默认值');
      } else {
        setNetworkStatus('offline');
        setError('网络连接失败，正在使用缓存数据');
      }
    } catch (err: any) {
      setNetworkStatus('offline');
      setError('数据加载异常: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ---------------------------------------------------------------------------
  // Update methods (async)
  // ---------------------------------------------------------------------------

  const updateProducts = useCallback(async (newProducts: Product[]): Promise<void> => {
    setNetworkStatus('syncing');
    try {
      const result = await putToApi('products', newProducts);
      if (result) {
        setProductsState(newProducts);
        cacheToLocalStorage('products', newProducts);
        setLastModified(result.lastModified);
        setNetworkStatus('online');
      } else {
        throw new Error('保存失败: 未授权或网络错误');
      }
    } catch (err: any) {
      setNetworkStatus('offline');
      throw new Error(err.message || '保存产品数据失败');
    }
  }, []);

  const updateContactInfo = useCallback(async (info: ContactInfo): Promise<void> => {
    setNetworkStatus('syncing');
    try {
      const result = await putToApi('contact_info', info);
      if (result) {
        setContactInfoState(info);
        cacheToLocalStorage('contact_info', info);
        setLastModified(result.lastModified);
        setNetworkStatus('online');
      } else {
        throw new Error('保存失败: 未授权或网络错误');
      }
    } catch (err: any) {
      setNetworkStatus('offline');
      throw new Error(err.message || '保存联系方式失败');
    }
  }, []);

  const updateCompanyInfo = useCallback(async (info: CompanyInfo): Promise<void> => {
    setNetworkStatus('syncing');
    try {
      const result = await putToApi('company_info', info);
      if (result) {
        setCompanyInfoState(info);
        cacheToLocalStorage('company_info', info);
        setLastModified(result.lastModified);
        setNetworkStatus('online');
      } else {
        throw new Error('保存失败: 未授权或网络错误');
      }
    } catch (err: any) {
      setNetworkStatus('offline');
      throw new Error(err.message || '保存公司信息失败');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Export / Import / Reset
  // ---------------------------------------------------------------------------

  const exportAllData = useCallback(async (): Promise<string> => {
    const [productsResult, contactResult, companyResult] = await Promise.all([
      fetchFromApi<Product[]>('products'),
      fetchFromApi<ContactInfo>('contact_info'),
      fetchFromApi<CompanyInfo>('company_info'),
    ]);

    const payload: AdminDataExport = {
      version: CURRENT_DATA_VERSION,
      exportedAt: new Date().toISOString(),
      products: productsResult?.data ?? products,
      contactInfo: contactResult?.data ?? contactInfo,
      companyInfo: companyResult?.data ?? companyInfo,
    };

    return JSON.stringify(payload, null, 2);
  }, [products, contactInfo, companyInfo]);

  const importAllData = useCallback(async (json: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(json) as Partial<AdminDataExport>;
      if (!parsed || typeof parsed !== 'object') return false;

      const dataMap: Record<string, any> = {};
      if (Array.isArray(parsed.products)) dataMap.products = parsed.products;
      if (parsed.contactInfo && typeof parsed.contactInfo === 'object') dataMap.contactInfo = parsed.contactInfo;
      if (parsed.companyInfo && typeof parsed.companyInfo === 'object') dataMap.companyInfo = parsed.companyInfo;
      if (typeof parsed.version === 'number') dataMap.version = parsed.version;

      if (Object.keys(dataMap).length === 0) return false;

      setNetworkStatus('syncing');
      const result = await postBulkToApi(dataMap);
      if (result) {
        // Refresh all data from API to reflect the import
        await fetchAllData();
        setNetworkStatus('online');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchAllData]);

  const resetAllData = useCallback(async (): Promise<void> => {
    setNetworkStatus('syncing');
    try {
      // Write seed defaults to each key
      await Promise.all([
        putToApi('products', DEFAULT_PRODUCTS),
        putToApi('contact_info', DEFAULT_CONTACT_INFO),
        putToApi('company_info', DEFAULT_COMPANY_INFO),
      ]);
      // Refresh from API
      await fetchAllData();
      // Clear localStorage cache
      clearAllCache();
      setNetworkStatus('online');
    } catch (err: any) {
      setNetworkStatus('offline');
      throw new Error(err.message || '重置数据失败');
    }
  }, [fetchAllData]);

  const refreshData = useCallback(async (): Promise<void> => {
    await fetchAllData();
  }, [fetchAllData]);

  // ---------------------------------------------------------------------------
  // Migration
  // ---------------------------------------------------------------------------

  const migrateLegacyData = useCallback(async (): Promise<boolean> => {
    const legacy = readLegacyData();
    if (!legacy) return false;

    const dataMap: Record<string, any> = {};
    if (legacy.products) dataMap.products = legacy.products;
    if (legacy.contactInfo) dataMap.contactInfo = legacy.contactInfo;
    if (legacy.companyInfo) dataMap.company_info = legacy.companyInfo;

    if (Object.keys(dataMap).length === 0) return false;

    try {
      setNetworkStatus('syncing');
      const result = await postBulkToApi(dataMap);
      if (result) {
        // Clear legacy localStorage keys
        clearLegacyData();
        // Clear cache too since we just wrote fresh data
        clearAllCache();
        // Refresh from API
        await fetchAllData();
        // Update legacy data detection flag
        setHasLegacyLocalStorageData(false);
        setNetworkStatus('online');
        return true;
      }
      return false;
    } catch {
      setNetworkStatus('offline');
      return false;
    }
  }, [fetchAllData]);

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

  const value: AdminDataContextValue = {
    products,
    contactInfo,
    companyInfo,
    dataVersion,
    lastModified,
    loading,
    error,
    networkStatus,
    updateProducts,
    updateContactInfo,
    updateCompanyInfo,
    exportAllData,
    importAllData,
    resetAllData,
    refreshData,
    hasLegacyLocalStorageData,
    migrateLegacyData,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

/**
 * Hook to access admin-managed data.
 * Must be used within an `AdminDataProvider`.
 */
export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (ctx === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return ctx;
}
