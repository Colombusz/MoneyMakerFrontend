import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCalendarData } from '../useCalendarData';
import { toDayKey } from '../../../shared/utils/date';
import { Transaction } from '../../../types';

// The API hands back full ISO timestamps; the grid is keyed by 'YYYY-MM-DD'.
const ISO = (day: string) => `${day}T00:00:00.000Z`;

const tx = (over: Partial<Transaction>): Transaction =>
  ({
    id: 't1',
    userId: 'u1',
    accountId: 'a1',
    type: 'expense',
    amountCentavos: 0,
    date: ISO('2026-10-05'),
    updatedAt: ISO('2026-10-05'),
    ...over,
  }) as Transaction;

describe('toDayKey', () => {
  it('reduces a full ISO timestamp to the calendar day', () => {
    expect(toDayKey(ISO('2026-10-05'))).toBe('2026-10-05');
  });

  it('leaves a bare calendar day untouched', () => {
    expect(toDayKey('2026-10-05')).toBe('2026-10-05');
  });

  it('returns an empty string for unparseable input', () => {
    expect(toDayKey('not-a-date')).toBe('');
  });
});

describe('useCalendarData day bucketing', () => {
  // Regression: dailyData used to be keyed by the raw ISO timestamp while the
  // grid cells are keyed by 'YYYY-MM-DD', so every per-day lookup missed and the
  // income/expense indicators never rendered.
  it('keys day summaries so they match the calendar cell keys', () => {
    const transactions = [
      tx({ id: 'a', type: 'income', amountCentavos: 100_000, date: ISO('2026-10-05') }),
      tx({ id: 'b', type: 'expense', amountCentavos: 25_000, date: ISO('2026-10-05') }),
    ];

    const { result } = renderHook(() => useCalendarData(transactions, [], [], []));

    const summary = result.current.dailyData['2026-10-05'];
    expect(summary).toBeDefined();
    expect(summary.incomeCentavos).toBe(100_000);
    expect(summary.expenseCentavos).toBe(25_000);
    expect(summary.txList).toHaveLength(2);
  });

  it('every populated day key is reachable from a rendered calendar cell', () => {
    const transactions = [
      tx({ id: 'a', type: 'income', amountCentavos: 100_000, date: ISO('2026-10-05') }),
      tx({ id: 'b', type: 'expense', amountCentavos: 5_000, date: ISO('2026-10-17') }),
    ];

    const { result } = renderHook(() => useCalendarData(transactions, [], [], []));

    const cellKeys = new Set(
      result.current.calendarDays.filter(Boolean).map((d) => d!.dateKey)
    );
    const populated = Object.keys(result.current.dailyData);

    expect(populated.length).toBeGreaterThan(0);
    // This is the invariant that was broken.
    for (const key of populated) {
      expect(cellKeys.has(key)).toBe(true);
    }
  });

  it('does not leak a transaction into the wrong day', () => {
    const transactions = [tx({ type: 'expense', amountCentavos: 9_000, date: ISO('2026-10-05') })];
    const { result } = renderHook(() => useCalendarData(transactions, [], [], []));

    expect(result.current.dailyData['2026-10-06']).toBeUndefined();
    expect(result.current.dailyData['2026-10-04']).toBeUndefined();
    expect(result.current.dailyData['2026-10-05']?.expenseCentavos).toBe(9_000);
  });

  it('places recurring occurrences on the same keys as transactions', () => {
    const transactions = [tx({ type: 'expense', amountCentavos: 5_000, date: ISO('2026-10-05') })];
    const occurrences = [
      {
        ruleId: 'r1',
        date: '2026-10-05',
        amountCentavos: 500,
        accountId: 'a1',
        categoryId: 'c1',
        type: 'expense' as const,
        notes: 'Rent',
        status: 'pending' as const,
      },
    ];

    const { result } = renderHook(() => useCalendarData(transactions, [], occurrences, []));

    const summary = result.current.dailyData['2026-10-05'];
    expect(summary?.txList).toHaveLength(1);
    expect(summary?.recurringList).toHaveLength(1);
  });
});

describe('toDayKey timezone safety', () => {
  // The machine running these tests is east of Greenwich, which is exactly where
  // a local-midnight round-trip silently moves the day backwards.
  it('never shifts a bare calendar day east of UTC', () => {
    expect(toDayKey('2026-10-05')).toBe('2026-10-05');
    expect(toDayKey('2026-01-01')).toBe('2026-01-01');
    expect(toDayKey('2026-12-31')).toBe('2026-12-31');
  });

  it('buckets full timestamps by UTC, like the server and Android', () => {
    expect(toDayKey('2026-10-05T00:00:00.000Z')).toBe('2026-10-05');
    expect(toDayKey('2026-10-05T23:59:59.999Z')).toBe('2026-10-05');
  });

  it('round-trips the value the calendar form submits', () => {
    // TransactionForm submits a bare YYYY-MM-DD; it must land on that exact day.
    expect(toDayKey('2026-10-05')).toBe('2026-10-05');
  });
});

describe('month totals agree with the day buckets', () => {
  // The month summary and the per-day buckets are derived from the same list, so
  // they must reconcile — otherwise the KPI cards and the grid disagree.
  it('month totals equal the sum of the rendered day buckets', () => {
    const transactions = [
      tx({ id: 'a', type: 'income', amountCentavos: 100_000, date: ISO('2026-10-05') }),
      tx({ id: 'b', type: 'expense', amountCentavos: 25_000, date: ISO('2026-10-05') }),
      tx({ id: 'c', type: 'expense', amountCentavos: 10_000, date: ISO('2026-10-20') }),
    ];

    const { result } = renderHook(() => useCalendarData(transactions, [], [], []));

    const buckets = result.current.calendarDays
      .filter(Boolean)
      .map((d) => result.current.dailyData[d!.dateKey])
      .filter(Boolean);

    const income = buckets.reduce((s, b) => s + b.incomeCentavos, 0);
    const expense = buckets.reduce((s, b) => s + b.expenseCentavos, 0);

    expect(income).toBe(result.current.totalIncomeCentavos);
    expect(expense).toBe(result.current.totalExpenseCentavos);
    expect(result.current.netCentavos).toBe(income - expense);
  });

  it('excludes transactions belonging to a different month', () => {
    // The hook renders the current month; a plainly-different month must not leak in.
    const other = tx({ type: 'expense', amountCentavos: 99_000, date: '2020-01-15T00:00:00.000Z' });
    const { result } = renderHook(() => useCalendarData([other], [], [], []));

    expect(result.current.totalExpenseCentavos).toBe(0);
    expect(result.current.dailyData['2020-01-15']).toBeUndefined();
  });
});
