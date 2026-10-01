import { describe, it, expect } from 'vitest';
import { formatDateToISO, formatDisplayDate, getDaysInMonth, getMonthBounds, parseDateValue } from '../date';

describe('date utilities', () => {
  it('formats Date instance to YYYY-MM-DD ISO format', () => {
    const d = new Date('2026-03-15T12:00:00Z');
    expect(formatDateToISO(d)).toBe('2026-03-15');
  });

  it('calculates correct days in a month', () => {
    expect(getDaysInMonth(2026, 1)).toBe(31); // Jan
    expect(getDaysInMonth(2026, 2)).toBe(28); // Feb non-leap
    expect(getDaysInMonth(2024, 2)).toBe(29); // Feb leap
    expect(getDaysInMonth(2026, 4)).toBe(30); // April
  });

  it('calculates correct UTC month bounds', () => {
    const { start, end } = getMonthBounds(2026, 3);
    expect(start.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-03-31T23:59:59.999Z');
  });

  it('does not shift bare YYYY-MM-DD values by a day', () => {
    // new Date('2026-01-01') is UTC midnight, which is Dec 31 in any negative
    // offset. parseDateValue must keep the calendar day that was stored.
    const parsed = parseDateValue('2026-01-01');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(0);
    expect(parsed.getDate()).toBe(1);
    expect(formatDisplayDate('2026-01-01')).toBe('Jan 1, 2026');
  });

  it('renders a full ISO timestamp without leaking the raw string', () => {
    const formatted = formatDisplayDate('2026-09-30T04:23:11.000Z');
    expect(formatted).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    expect(formatted).not.toContain('T');
  });

  it('returns an empty string for unparseable dates', () => {
    expect(formatDisplayDate('not-a-date')).toBe('');
  });
});
