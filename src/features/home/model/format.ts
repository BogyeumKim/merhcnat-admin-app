import { getCurrentLanguage } from '@/shared/i18n';

const LOCALES = { ko: 'ko-KR', en: 'en-US' } as const;

/** Full amount with thousands separators: 1,250,000. */
export const formatAmount = (value: number) => new Intl.NumberFormat(LOCALES[getCurrentLanguage()]).format(value);

/**
 * Short amount for narrow cards, so a figure never wraps to a second line (ko: 2,843만, 1.2억; en: 28.4M). Written by hand:
 * `Intl.NumberFormat` compact notation is not reliable across the JS engines' ICU data.
 */
export function formatCompactAmount(value: number): string {
  if (getCurrentLanguage() === 'ko') {
    if (value >= 100_000_000) return `${Math.round(value / 10_000_000) / 10}억`;
    if (value >= 10_000) return `${new Intl.NumberFormat('ko-KR').format(Math.round(value / 10_000))}만`;
    return formatAmount(value);
  }
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}M`;
  if (value >= 1_000) return `${Math.round(value / 100) / 10}K`;
  return formatAmount(value);
}

/** Short weekday name for an ISO date (ko: 수, en: Wed). */
export const formatWeekday = (isoDate: string) =>
  new Intl.DateTimeFormat(LOCALES[getCurrentLanguage()], { weekday: 'short' }).format(new Date(`${isoDate}T00:00:00`));

/** ISO date to "MM.DD" (2026-11-04 -> 11.04). Anything that is not an ISO date is returned as is. */
export function formatMonthDay(isoDate: string): string {
  const match = /^\d{4}-(\d{2})-(\d{2})/.exec(isoDate);
  return match ? `${match[1]}.${match[2]}` : isoDate;
}

/** Clock time of a timestamp (14:32), in the 24-hour style Korean apps use for "as of" labels. */
export const formatClock = (timestamp: number) =>
  new Intl.DateTimeFormat(LOCALES[getCurrentLanguage()], { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp));
