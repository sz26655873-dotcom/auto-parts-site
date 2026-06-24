/**
 * AdminDataContext — central data provider for the entire application.
 *
 * Wraps both the front-end site and the admin backend. Reads products,
 * contact info, and company info from localStorage on mount (falling back
 * to code defaults when localStorage is empty). All setters persist to
 * localStorage immediately, so changes made in admin are reflected on
 * the front-end without a page reload.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Product } from '../data/products';
import {
  getProducts,
  setProducts as storageSetProducts,
  getContactInfo,
  setContactInfo as storageSetContactInfo,
  getCompanyInfo,
  setCompanyInfo as storageSetCompanyInfo,
  exportData as storageExportData,
  importData as storageImportData,
  resetData as storageResetData,
  getDataVersion,
  getLastModified,
  type ContactInfo,
  type CompanyInfo,
} from './adminStorage';

/** Context value exposed to consumers via `useAdminData()`. */
interface AdminDataContextValue {
  /** Current product catalog (from localStorage or defaults). */
  products: Product[];
  /** Current contact information. */
  contactInfo: ContactInfo;
  /** Current company information. */
  companyInfo: CompanyInfo;
  /** Data schema version. */
  dataVersion: number;
  /** ISO timestamp of the last data modification (or null). */
  lastModified: string | null;

  /** Replaces the entire product catalog and persists to localStorage. */
  updateProducts: (products: Product[]) => void;
  /** Updates contact information and persists to localStorage. */
  updateContactInfo: (info: ContactInfo) => void;
  /** Updates company information and persists to localStorage. */
  updateCompanyInfo: (info: CompanyInfo) => void;

  /** Returns a JSON string of all admin data for download. */
  exportAllData: () => string;
  /** Imports admin data from a JSON string. Returns success boolean. */
  importAllData: (json: string) => boolean;
  /** Resets all admin data to code defaults. */
  resetAllData: () => void;
  /** Reloads all data from localStorage into React state. */
  reloadFromStorage: () => void;
}

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

interface AdminDataProviderProps {
  children: ReactNode;
}

/**
 * Provides admin-managed data to the entire app.
 * Must be used within a `LanguageProvider` (for translation defaults).
 */
export function AdminDataProvider({ children }: AdminDataProviderProps): JSX.Element {
  const [products, setProductsState] = useState<Product[]>(() => getProducts());
  const [contactInfo, setContactInfoState] = useState<ContactInfo>(() => getContactInfo());
  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>(() => getCompanyInfo());
  const [dataVersion, setDataVersion] = useState<number>(() => getDataVersion());
  const [lastModified, setLastModified] = useState<string | null>(() => getLastModified());

  const updateProducts = useCallback((newProducts: Product[]): void => {
    storageSetProducts(newProducts);
    setProductsState(newProducts);
    setLastModified(getLastModified());
  }, []);

  const updateContactInfo = useCallback((info: ContactInfo): void => {
    storageSetContactInfo(info);
    setContactInfoState(info);
    setLastModified(getLastModified());
  }, []);

  const updateCompanyInfo = useCallback((info: CompanyInfo): void => {
    storageSetCompanyInfo(info);
    setCompanyInfoState(info);
    setLastModified(getLastModified());
  }, []);

  const exportAllData = useCallback((): string => {
    return storageExportData();
  }, []);

  const importAllData = useCallback((json: string): boolean => {
    const success = storageImportData(json);
    if (success) {
      setProductsState(getProducts());
      setContactInfoState(getContactInfo());
      setCompanyInfoState(getCompanyInfo());
      setDataVersion(getDataVersion());
      setLastModified(getLastModified());
    }
    return success;
  }, []);

  const resetAllData = useCallback((): void => {
    storageResetData();
    setProductsState(getProducts());
    setContactInfoState(getContactInfo());
    setCompanyInfoState(getCompanyInfo());
    setDataVersion(getDataVersion());
    setLastModified(getLastModified());
  }, []);

  const reloadFromStorage = useCallback((): void => {
    setProductsState(getProducts());
    setContactInfoState(getContactInfo());
    setCompanyInfoState(getCompanyInfo());
    setDataVersion(getDataVersion());
    setLastModified(getLastModified());
  }, []);

  const value: AdminDataContextValue = {
    products,
    contactInfo,
    companyInfo,
    dataVersion,
    lastModified,
    updateProducts,
    updateContactInfo,
    updateCompanyInfo,
    exportAllData,
    importAllData,
    resetAllData,
    reloadFromStorage,
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
