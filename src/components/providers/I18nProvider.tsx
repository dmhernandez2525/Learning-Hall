'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  Locale,
  defaultLocale,
  locales,
  getTextDirection,
} from '@/lib/i18n/config';
import { getMessages, Messages } from '@/lib/i18n/messages';
import { detectUserLocale, saveLocalePreference } from '@/lib/i18n/utils';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
  direction: 'ltr' | 'rtl';
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [messages, setMessages] = useState<Messages>(getMessages(initialLocale || defaultLocale));
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  // Initialize locale from browser/storage on mount
  useEffect(() => {
    if (!initialLocale) {
      const detectedLocale = detectUserLocale();
      setLocaleState(detectedLocale);
      setMessages(getMessages(detectedLocale));
      setDirection(getTextDirection(detectedLocale));
    } else {
      setDirection(getTextDirection(initialLocale));
    }
    setIsLoading(false);
  }, [initialLocale]);

  // Update document attributes when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
    }
  }, [locale, direction]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`);
      return;
    }

    setLocaleState(newLocale);
    setMessages(getMessages(newLocale));
    setDirection(getTextDirection(newLocale));
    saveLocalePreference(newLocale);
  }, []);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        messages,
        direction,
        isLoading,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// HOC for components that need i18n
export function withI18n<P extends object>(
  Component: React.ComponentType<P & { locale: Locale; t: (key: string) => string }>
) {
  return function WrappedComponent(props: P) {
    const { locale, messages } = useI18n();

    const t = useCallback(
      (key: string): string => {
        const keys = key.split('.');
        let value: unknown = messages;

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
          } else {
            return key;
          }
        }

        return typeof value === 'string' ? value : key;
      },
      [messages]
    );

    return <Component {...props} locale={locale} t={t} />;
  };
}
