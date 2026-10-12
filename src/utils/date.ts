import type { Language } from '../i18n';

const locale = (language: Language) => `${language}-IN`;

/** Local calendar date as YYYY-MM-DD, the format /slots expects. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Today and the following days, at local midnight. */
export function nextDays(count: number, from = new Date()): Date[] {
  return Array.from(
    { length: count },
    (_, offset) =>
      new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset),
  );
}

/** "5:30 pm" in the user's language. */
export const formatTime = (iso: string, language: Language) =>
  new Date(iso).toLocaleTimeString(locale(language), {
    hour: 'numeric',
    minute: '2-digit',
  });

/** "Mon" */
export const formatWeekday = (date: Date, language: Language) =>
  date.toLocaleDateString(locale(language), { weekday: 'short' });

/** "Mon, 12 Oct" */
export const formatDay = (iso: string, language: Language) =>
  new Date(iso).toLocaleDateString(locale(language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
