// i18n utility functions
import { Locale, locales, defaultLocale, localeFormats, isValidLocale } from './config';
import { getMessages, Messages } from './messages';

// Get nested translation value by dot-notation key
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<Messages>;

// Get a translation value by key path
export function getTranslation(
  messages: Messages,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: unknown = messages;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Return key if translation not found
      return key;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace placeholders with params
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params[paramKey]?.toString() || `{${paramKey}}`;
    });
  }

  return value;
}

// Detect user's preferred locale from browser settings
export function detectUserLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Check localStorage first
  const storedLocale = localStorage.getItem('locale');
  if (storedLocale && isValidLocale(storedLocale)) {
    return storedLocale;
  }

  // Check navigator languages
  const browserLanguages = navigator.languages || [navigator.language];

  for (const lang of browserLanguages) {
    const locale = lang.split('-')[0].toLowerCase();
    if (isValidLocale(locale)) {
      return locale;
    }
  }

  return defaultLocale;
}

// Save locale preference
export function saveLocalePreference(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
}

// Format date according to locale
export function formatDate(
  date: Date | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatOptions = options || localeFormats[locale].dateFormat;

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

// Format number according to locale
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  const formatOptions = options || localeFormats[locale].numberFormat;
  return new Intl.NumberFormat(locale, formatOptions).format(value);
}

// Format currency according to locale
export function formatCurrency(
  value: number,
  locale: Locale,
  currency?: string
): string {
  const formatOptions = { ...localeFormats[locale].currencyFormat };
  if (currency) {
    formatOptions.currency = currency;
  }
  return new Intl.NumberFormat(locale, formatOptions).format(value);
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(
  date: Date | string,
  locale: Locale
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffYears > 0) return rtf.format(-diffYears, 'year');
  if (diffMonths > 0) return rtf.format(-diffMonths, 'month');
  if (diffWeeks > 0) return rtf.format(-diffWeeks, 'week');
  if (diffDays > 0) return rtf.format(-diffDays, 'day');
  if (diffHours > 0) return rtf.format(-diffHours, 'hour');
  if (diffMins > 0) return rtf.format(-diffMins, 'minute');
  return rtf.format(-diffSecs, 'second');
}

// Format list according to locale
export function formatList(
  items: string[],
  locale: Locale,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  return new Intl.ListFormat(locale, { style: 'long', type }).format(items);
}

// Pluralization helper
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: Locale
): string {
  const pr = new Intl.PluralRules(locale);
  const rule = pr.select(count);

  // Most languages use 'one' for singular
  if (rule === 'one') {
    return singular;
  }

  return plural;
}

// Create a translator function for a specific locale
export function createTranslator(locale: Locale) {
  const messages = getMessages(locale);

  return function t(key: string, params?: Record<string, string | number>): string {
    return getTranslation(messages, key, params);
  };
}

// Direction for RTL languages (none currently in our supported locales, but ready for expansion)
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  const rtlLocales: string[] = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

// Get locale from URL path
export function getLocaleFromPath(path: string): Locale | null {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment;
  }

  return null;
}

// Build URL with locale prefix
export function buildLocalizedUrl(path: string, locale: Locale): string {
  // Remove existing locale prefix if present
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isValidLocale(firstSegment)) {
    segments.shift();
  }

  // Don't add prefix for default locale (optional behavior)
  // Uncomment if you want default locale without prefix:
  // if (locale === defaultLocale) {
  //   return '/' + segments.join('/');
  // }

  return `/${locale}/${segments.join('/')}`;
}

// Export helper for static generation
export function getStaticLocales(): Locale[] {
  return [...locales];
}
