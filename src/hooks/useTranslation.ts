'use client';

import { useCallback, useMemo } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import {
  getTranslation,
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  formatList,
  pluralize,
} from '@/lib/i18n/utils';
import { getMessages, Messages } from '@/lib/i18n/messages';

export function useTranslation() {
  const { locale, setLocale, messages } = useI18n();

  // Main translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return getTranslation(messages, key, params);
    },
    [messages]
  );

  // Format date with locale
  const date = useCallback(
    (value: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      return formatDate(value, locale, options);
    },
    [locale]
  );

  // Format number with locale
  const number = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return formatNumber(value, locale, options);
    },
    [locale]
  );

  // Format currency with locale
  const currency = useCallback(
    (value: number, currencyCode?: string): string => {
      return formatCurrency(value, locale, currencyCode);
    },
    [locale]
  );

  // Format relative time (e.g., "2 days ago")
  const relativeTime = useCallback(
    (value: Date | string): string => {
      return formatRelativeTime(value, locale);
    },
    [locale]
  );

  // Format list with locale
  const list = useCallback(
    (items: string[], type: 'conjunction' | 'disjunction' = 'conjunction'): string => {
      return formatList(items, locale, type);
    },
    [locale]
  );

  // Pluralization helper
  const plural = useCallback(
    (count: number, singular: string, pluralForm: string): string => {
      return pluralize(count, singular, pluralForm, locale);
    },
    [locale]
  );

  return {
    t,
    locale,
    setLocale,
    messages,
    formatters: {
      date,
      number,
      currency,
      relativeTime,
      list,
      plural,
    },
  };
}

// Hook for getting a specific translation namespace
export function useTranslationNamespace<K extends keyof Messages>(namespace: K) {
  const { locale } = useI18n();
  const messages = useMemo(() => getMessages(locale), [locale]);

  const t = useCallback(
    (key: keyof Messages[K], params?: Record<string, string | number>): string => {
      const fullKey = `${String(namespace)}.${String(key)}`;
      return getTranslation(messages, fullKey, params);
    },
    [messages, namespace]
  );

  return { t, locale };
}

// Hook for common translations
export function useCommonTranslations() {
  return useTranslationNamespace('common');
}

// Hook for auth translations
export function useAuthTranslations() {
  return useTranslationNamespace('auth');
}

// Hook for course translations
export function useCourseTranslations() {
  return useTranslationNamespace('courses');
}

// Hook for navigation translations
export function useNavigationTranslations() {
  return useTranslationNamespace('navigation');
}

// Hook for error translations
export function useErrorTranslations() {
  return useTranslationNamespace('errors');
}

export default useTranslation;
