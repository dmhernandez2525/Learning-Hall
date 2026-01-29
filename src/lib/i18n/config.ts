// Internationalization configuration

export const locales = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'ko'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇧🇷',
  ja: '🇯🇵',
  zh: '🇨🇳',
  ko: '🇰🇷',
};

// Date and number formatting options for each locale
export const localeFormats: Record<
  Locale,
  {
    dateFormat: Intl.DateTimeFormatOptions;
    numberFormat: Intl.NumberFormatOptions;
    currencyFormat: Intl.NumberFormatOptions;
  }
> = {
  en: {
    dateFormat: { month: 'short', day: 'numeric', year: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'USD' },
  },
  es: {
    dateFormat: { day: 'numeric', month: 'short', year: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  fr: {
    dateFormat: { day: 'numeric', month: 'short', year: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  de: {
    dateFormat: { day: 'numeric', month: 'short', year: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  pt: {
    dateFormat: { day: 'numeric', month: 'short', year: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'BRL' },
  },
  ja: {
    dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'JPY' },
  },
  zh: {
    dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'CNY' },
  },
  ko: {
    dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'KRW' },
  },
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
