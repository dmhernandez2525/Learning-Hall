'use client';

import { useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, localeNames, localeFlags, Locale } from '@/lib/i18n/config';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'full';
  showFlag?: boolean;
  showLabel?: boolean;
}

export function LanguageSwitcher({
  className,
  variant = 'default',
  showFlag = true,
  showLabel = true,
}: LanguageSwitcherProps) {
  const { locale, setLocale, isLoading } = useI18n();
  const [open, setOpen] = useState(false);

  const handleLocaleChange = async (newLocale: Locale) => {
    setLocale(newLocale);
    setOpen(false);

    // Optionally save preference to server
    try {
      await fetch('/api/user/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      });
    } catch {
      // Silently fail - local storage already updated
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <Globe className="h-4 w-4 animate-pulse" />
      </Button>
    );
  }

  if (variant === 'minimal') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <span className="text-lg">{localeFlags[locale]}</span>
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className="cursor-pointer"
            >
              <span className="mr-2">{localeFlags[loc]}</span>
              {localeNames[loc]}
              {loc === locale && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('grid grid-cols-2 gap-2', className)}>
        {locales.map((loc) => (
          <Button
            key={loc}
            variant={loc === locale ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLocaleChange(loc)}
            className="justify-start"
          >
            {showFlag && <span className="mr-2">{localeFlags[loc]}</span>}
            {localeNames[loc]}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {showFlag && <span className="mr-2">{localeFlags[locale]}</span>}
          {showLabel && <span className="mr-1">{localeNames[locale]}</span>}
          <Globe className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              'cursor-pointer',
              loc === locale && 'bg-accent'
            )}
          >
            {showFlag && <span className="mr-2">{localeFlags[loc]}</span>}
            <span className="flex-1">{localeNames[loc]}</span>
            {loc === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact language selector for mobile
export function LanguageButton({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Globe className="h-4 w-4" />
          <span className="ml-1 uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className="cursor-pointer"
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
            {loc === locale && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
