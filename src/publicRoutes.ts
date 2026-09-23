import type { Saint, Site } from './types';
import type { Locale } from './i18n';

export type PublicRoute =
  | { kind: 'home'; locale: Locale }
  | { kind: 'saint'; locale: Locale; ordinal: number }
  | { kind: 'story'; locale: Locale; ordinal: number }
  | { kind: 'sthalam'; locale: Locale; siteId: string };

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function saintSlug(saint: Saint, englishName?: string) {
  const label = slugify(englishName || saint.label) || 'nayanmar';
  return `${String(saint.ordinal).padStart(2, '0')}-${label}`;
}

export function siteSlug(site: Site) {
  const label = slugify(site.modern_name_nic || site.label) || 'sthalam';
  return `${site.site_id.toLowerCase()}-${label}`;
}

export function saintPath(locale: Locale, saint: Saint, englishName?: string) {
  return `/${locale}/nayanmar/${saintSlug(saint, englishName)}/`;
}

export function storyPath(locale: Locale, saint: Saint, englishName?: string) {
  return `/${locale}/story/${saintSlug(saint, englishName)}/`;
}

export function sitePath(locale: Locale, site: Site) {
  return `/${locale}/sthalam/${siteSlug(site)}/`;
}

export function homePath(locale: Locale) {
  return `/${locale}/`;
}

export function absoluteUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

export function parsePublicRoute(pathname: string): PublicRoute | null {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return null;
  const locale: Locale = parts[0] === 'ta' ? 'ta' : parts[0] === 'en' ? 'en' : 'en';
  if (parts[0] !== 'en' && parts[0] !== 'ta') return null;
  if (parts.length === 1) return { kind: 'home', locale };

  if ((parts[1] === 'nayanmar' || parts[1] === 'story') && parts[2]) {
    const ordinal = Number(parts[2].match(/^(\d{1,2})/)?.[1] ?? NaN);
    if (!Number.isFinite(ordinal) || ordinal < 1 || ordinal > 63) return null;
    return { kind: parts[1] === 'story' ? 'story' : 'saint', locale, ordinal };
  }

  if (parts[1] === 'sthalam' && parts[2]) {
    const siteId = parts[2].match(/^([a-z]{1,3}\d{1,4})/i)?.[1]?.toUpperCase();
    if (!siteId) return null;
    return { kind: 'sthalam', locale, siteId };
  }

  return null;
}
