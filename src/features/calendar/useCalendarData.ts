import { useState, useMemo } from 'react';
import { Transaction, Category, WebProjectedOccurrence, Account } from '../../types';
import { toDayKey } from '../../shared/utils/date';

export interface DailySummary {
  incomeCentavos: number;
  expenseCentavos: number;
  txList: Transaction[];
  recurringList: WebProjectedOccurrence[];
}

export const useCalendarData = (
  transactions: Transaction[],
  categories: Category[],
  recurringOccurrences: WebProjectedOccurrence[],
  accounts: Account[]
) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const monthPrefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;

  const monthTransactions = useMemo(() => {
    // Uses the same UTC day key as the bucketing below, so filtering and grouping
    // can never disagree. (For a full ISO timestamp this is equivalent to the
    // previous raw `.startsWith(monthPrefix)` check — an ISO string's first 10
    // characters already are its UTC date — but routing both through `toDayKey`
    // keeps one definition of "which day is this" in the codebase.)
    return transactions.filter((t) => toDayKey(t.date).startsWith(monthPrefix));
  }, [transactions, monthPrefix]);

  const totalIncomeCentavos = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amountCentavos, 0);
  }, [monthTransactions]);

  const totalExpenseCentavos = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amountCentavos, 0);
  }, [monthTransactions]);

  const netCentavos = totalIncomeCentavos - totalExpenseCentavos;

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<
      string,
      { category: Category | undefined; amountCentavos: number; count: number; catKey: string }
    > = {};
    for (const t of monthTransactions) {
      if (t.type === "expense") {
        const catKey = t.categoryId
          ? t.categoryId
          : t.goalId
            ? "__shared_goal__"
            : t.sharedAccountId
              ? "__shared_account__"
              : "__uncategorized__";
        if (!map[catKey]) {
          map[catKey] = {
            category: categoryMap.get(catKey),
            amountCentavos: 0,
            count: 0,
            catKey,
          };
        }
        map[catKey].amountCentavos += t.amountCentavos;
        map[catKey].count += 1;
      }
    }
    return Object.values(map).sort((a, b) => b.amountCentavos - a.amountCentavos);
  }, [monthTransactions, categoryMap]);

  const dailyData = useMemo(() => {
    const map: Record<string, DailySummary> = {};

    for (const t of monthTransactions) {
      // Key by the calendar day, not the raw ISO timestamp — otherwise these keys
      // never match the 'YYYY-MM-DD' cell keys and no indicator ever renders.
      const key = toDayKey(t.date);
      if (!map[key]) {
        map[key] = { incomeCentavos: 0, expenseCentavos: 0, txList: [], recurringList: [] };
      }
      if (t.type === 'income') map[key].incomeCentavos += t.amountCentavos;
      if (t.type === 'expense') map[key].expenseCentavos += t.amountCentavos;
      map[key].txList.push(t);
    }

    for (const r of recurringOccurrences) {
      if (r.date.startsWith(monthPrefix)) {
        if (!map[r.date]) {
          map[r.date] = { incomeCentavos: 0, expenseCentavos: 0, txList: [], recurringList: [] };
        }
        map[r.date].recurringList.push(r);
      }
    }

    return map;
  }, [monthTransactions, recurringOccurrences, monthPrefix]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: Array<{ dateKey: string; dayNum: number } | null> = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${monthPrefix}-${d.toString().padStart(2, '0')}`;
      days.push({ dateKey, dayNum: d });
    }
    return days;
  }, [firstDayOfWeek, daysInMonth, monthPrefix]);

  return {
    year,
    month,
    currentDate,
    selectedDay,
    setSelectedDay,
    monthName,
    monthPrefix,
    goToPrevMonth,
    goToNextMonth,
    monthTransactions,
    totalIncomeCentavos,
    totalExpenseCentavos,
    netCentavos,
    categoryBreakdown,
    dailyData,
    calendarDays,
    categoryMap,
    accountMap
  };
};
