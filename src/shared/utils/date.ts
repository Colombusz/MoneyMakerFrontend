export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Parse anything the API can hand us into a Date without the classic
 * `new Date('2026-09-30')` pitfall: bare `YYYY-MM-DD` strings are parsed as
 * UTC midnight, which renders as the *previous* day for anyone west of
 * Greenwich. We treat date-only values as local dates instead.
 */
export const parseDateValue = (value: string | number | Date): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

export const formatDisplayDate = (dateStr: string | number | Date): string => {
  const d = parseDateValue(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Reduce any stored date to the 'YYYY-MM-DD' calendar key the grid is keyed by.
 *
 * The API returns timestamps as full ISO strings ('2026-10-05T00:00:00.000Z')
 * while the calendar builds cell keys as 'YYYY-MM-DD'. Keying a lookup table by
 * the raw ISO string silently never matches, so every per-day lookup (income and
 * expense indicators, the day detail panel) comes back empty. Normalise once,
 * here, using the same UTC derivation as the Android client.
 *
 * Note this deliberately does NOT round-trip through a local Date: a bare
 * 'YYYY-MM-DD' is already the answer and is returned verbatim. Parsing it as
 * local midnight and re-serialising to UTC would move the day for anyone east of
 * Greenwich. Full timestamps are bucketed by UTC, matching how the server and
 * the Android client store them.
 */
export const toDayKey = (value: string | number | Date): string => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const getMonthBounds = (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
};
