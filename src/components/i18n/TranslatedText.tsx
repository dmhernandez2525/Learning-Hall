'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  /** Translation key (e.g., "common.save", "auth.login") */
  textKey: string;
  /** Optional parameters to interpolate */
  params?: Record<string, string | number>;
  /** Fallback text if translation not found */
  fallback?: string;
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
  /** Additional class names */
  className?: string;
}

export function TranslatedText({
  textKey,
  params,
  fallback,
  as: Component = 'span',
  className,
}: TranslatedTextProps) {
  const { t } = useTranslation();
  const text = t(textKey, params);

  // If translation not found (returns the key), use fallback
  const displayText = text === textKey && fallback ? fallback : text;

  return <Component className={className}>{displayText}</Component>;
}

// Shorthand components for common elements
export function TranslatedH1({
  textKey,
  params,
  className,
}: Omit<TranslatedTextProps, 'as'>) {
  return (
    <TranslatedText textKey={textKey} params={params} as="h1" className={className} />
  );
}

export function TranslatedH2({
  textKey,
  params,
  className,
}: Omit<TranslatedTextProps, 'as'>) {
  return (
    <TranslatedText textKey={textKey} params={params} as="h2" className={className} />
  );
}

export function TranslatedP({
  textKey,
  params,
  className,
}: Omit<TranslatedTextProps, 'as'>) {
  return (
    <TranslatedText textKey={textKey} params={params} as="p" className={className} />
  );
}

export function TranslatedSpan({
  textKey,
  params,
  className,
}: Omit<TranslatedTextProps, 'as'>) {
  return (
    <TranslatedText textKey={textKey} params={params} as="span" className={className} />
  );
}

export function TranslatedLabel({
  textKey,
  params,
  className,
  htmlFor,
}: Omit<TranslatedTextProps, 'as'> & { htmlFor?: string }) {
  const { t } = useTranslation();
  const text = t(textKey, params);

  return (
    <label htmlFor={htmlFor} className={className}>
      {text}
    </label>
  );
}
