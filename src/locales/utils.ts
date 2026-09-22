import { defaultLocale, type Locale } from './locales';
import { ui, type UiDictionary } from './ui';

export function useTranslations(locale: Locale): UiDictionary {
  return ui[locale];
}

export function getAlternateUrl(pathname: string, targetLocale: Locale): string {
  const withoutLocalePrefix = pathname.replace(/^\/en\/?/, '/');
  if (targetLocale === defaultLocale) return withoutLocalePrefix;
  return withoutLocalePrefix === '/' ? `/${targetLocale}/` : `/${targetLocale}${withoutLocalePrefix}`;
}
