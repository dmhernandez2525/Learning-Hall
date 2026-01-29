// Translation message exports
export { en, type TranslationKeys } from './en';
export { es } from './es';
export { fr } from './fr';
export { de } from './de';
export { pt } from './pt';
export { ja } from './ja';
export { zh } from './zh';
export { ko } from './ko';

import { en, TranslationKeys } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { pt } from './pt';
import { ja } from './ja';
import { zh } from './zh';
import { ko } from './ko';
import { Locale } from '../config';

// Type for all messages
export type Messages = typeof en;

// Message map by locale
export const messages: Record<Locale, Messages> = {
  en,
  es,
  fr,
  de,
  pt,
  ja,
  zh,
  ko,
};

// Get messages for a specific locale with fallback to English
export function getMessages(locale: Locale): Messages {
  return messages[locale] || messages.en;
}

// Deep merge function for translation objects
export function mergeMessages(base: Messages, override: Partial<Messages>): Messages {
  const result = { ...base };

  for (const key of Object.keys(override) as (keyof Messages)[]) {
    const overrideValue = override[key];
    if (overrideValue && typeof overrideValue === 'object') {
      result[key] = {
        ...base[key],
        ...overrideValue,
      } as Messages[typeof key];
    }
  }

  return result;
}

export type { TranslationKeys };
