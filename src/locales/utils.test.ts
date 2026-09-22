import { describe, expect, it } from 'vitest';
import { getAlternateUrl, useTranslations } from './utils';

describe('useTranslations', () => {
  it('returns the pt dictionary', () => {
    expect(useTranslations('pt').aboutTitle).toBe('Sobre');
  });

  it('returns the en dictionary', () => {
    expect(useTranslations('en').aboutTitle).toBe('About');
  });
});

describe('getAlternateUrl', () => {
  it('adds the /en prefix from the pt root', () => {
    expect(getAlternateUrl('/', 'en')).toBe('/en/');
  });

  it('strips the /en prefix back to pt', () => {
    expect(getAlternateUrl('/en/', 'pt')).toBe('/');
  });

  it('preserves subpaths in both directions', () => {
    expect(getAlternateUrl('/en/projetos', 'pt')).toBe('/projetos');
    expect(getAlternateUrl('/projetos', 'en')).toBe('/en/projetos');
  });
});
