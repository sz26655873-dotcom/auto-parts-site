import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  translations,
  RTL_LANGUAGES,
  type Language,
} from './translations';

/**
 * Language context value exposed to consumers via `useLanguage()`.
 */
interface LanguageContextValue {
  /** Current active language. */
  lang: Language;
  /** Whether the current language uses right-to-left direction. */
  isRTL: boolean;
  /** Switch the active language. */
  setLang: (lang: Language) => void;
  /** Translate a key to the current language. Falls back to the key itself. */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Provides language state, translation function, and RTL direction management
 * to the entire app. Defaults to English ('en') for the international audience.
 *
 * When a right-to-left language (Arabic) is selected, `document.dir` is set
 * to 'rtl' so that the browser and CSS engines render content accordingly.
 */
export function LanguageProvider({ children }: LanguageProviderProps): JSX.Element {
  const [lang, setLang] = useState<Language>('en');

  const isRTL = RTL_LANGUAGES.includes(lang);

  // Sync document direction with the active language for proper RTL/LTR rendering.
  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const t = useCallback(
    (key: string): string => {
      return translations[lang][key] ?? key;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, isRTL, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the language context.
 * Must be used within a `LanguageProvider`.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
