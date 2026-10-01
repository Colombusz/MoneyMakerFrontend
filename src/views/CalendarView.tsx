import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, StickyNote } from 'lucide-react';
import { Transaction, Category, WebProjectedOccurrence, Account } from '../types';
import { formatCentavosToPHP } from '../shared/utils/currency';
import { useCalendarData } from '../features/calendar/useCalendarData';
import { useDayNotes } from '../features/calendar/useDayNotes';
import { CalendarDayCell } from '../features/calendar/CalendarDayCell';
import { CalendarDayDetail } from '../features/calendar/CalendarDayDetail';
import { CategoryPieChart } from '../features/calendar/CategoryPieChart';
import { AddTransactionModal } from '../features/transactions/AddTransactionModal';
import { TransactionFormData } from '../features/transactions/TransactionForm';
import { Card, IconButton, ScreenContainer, Pill } from '../shared/components/ui';

interface CalendarViewProps {
  transactions: Transaction[];
  categories: Category[];
  recurringOccurrences: WebProjectedOccurrence[];
  accounts: Account[];
  currency: string;
  isAuthenticated: boolean;
  onAddTransaction: (tx: TransactionFormData) => Promise<void>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  categories,
  recurringOccurrences,
  accounts,
  currency = 'PHP',
  isAuthenticated,
  onAddTransaction
}) => {
  // Non-null while the add form is open, pinned to a day + type.
  const [addTarget, setAddTarget] = useState<{
    date: string;
    type: 'expense' | 'income';
  } | null>(null);
  const {
    year,
    monthName,
    currentDate,
    selectedDay,
    setSelectedDay,
    goToPrevMonth,
    goToNextMonth,
    totalIncomeCentavos,
    totalExpenseCentavos,
    netCentavos,
    categoryBreakdown,
    dailyData,
    calendarDays,
    categoryMap,
    accountMap
  } = useCalendarData(transactions, categories, recurringOccurrences, accounts);

  const { error: dayNotesError, fetchDayNotes, saveDayNote, buildNoteMap, notesMapEquals } =
    useDayNotes(isAuthenticated);
  const [dayNotes, setDayNotes] = useState<Map<string, string>>(new Map());

  const monthPrefix = `${year}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

  // Reload the visible month's notes whenever the month or auth state changes.
  useEffect(() => {
    let cancelled = false;
    fetchDayNotes(monthPrefix).then((notes) => {
      if (cancelled) return;
      // Return the previous map when the contents are identical so React bails
      // out of the re-render; storing an equal-but-new Map every time is what
      // turns this effect into a request loop.
      setDayNotes((prev) => {
        const next = buildNoteMap(notes);
        return notesMapEquals(prev, next) ? prev : next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [fetchDayNotes, buildNoteMap, notesMapEquals, monthPrefix, isAuthenticated]);

  const handleSaveDayNote = useCallback(
    async (dateKey: string, notes: string) => {
      await saveDayNote(dateKey, notes);
      // Reflect the write locally; the next month change re-fetches from the API.
      setDayNotes((prev) => {
        const next = new Map(prev);
        if (notes.trim()) next.set(dateKey, notes.trim());
        else next.delete(dateKey);
        return next;
      });
    },
    [saveDayNote]
  );

  const todayKey = new Date().toISOString().split('T')[0];

  return (
    <ScreenContainer className="space-y-4">
      {/* Month Navigation Header */}
      <Card variant="primary" className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
            {monthName} {year}
          </h2>
          <p className="text-xs text-light-textMuted dark:text-dark-textMuted">Monthly Cash Flow & Forecast</p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={<ChevronLeft className="w-5 h-5" />}
            label="Previous Month"
            onClick={goToPrevMonth}
            variant="ghost"
            size="sm"
          />
          <IconButton
            icon={<ChevronRight className="w-5 h-5" />}
            label="Next Month"
            onClick={goToNextMonth}
            variant="ghost"
            size="sm"
          />
        </div>
      </Card>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card variant="primary" padding="sm" className="flex flex-col justify-between">
          <span className="text-[11px] font-medium text-light-textMuted dark:text-dark-textMuted flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-dark-success" /> Income
          </span>
          <span className="text-xs sm:text-sm font-bold text-dark-success truncate mt-1">
            +{formatCentavosToPHP(totalIncomeCentavos)}
          </span>
        </Card>
        <Card variant="primary" padding="sm" className="flex flex-col justify-between">
          <span className="text-[11px] font-medium text-light-textMuted dark:text-dark-textMuted flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-dark-expense" /> Expense
          </span>
          <span className="text-xs sm:text-sm font-bold text-dark-expense truncate mt-1">
            -{formatCentavosToPHP(totalExpenseCentavos)}
          </span>
        </Card>
        <Card variant="primary" padding="sm" className="flex flex-col justify-between">
          <span className="text-[11px] font-medium text-light-textMuted dark:text-dark-textMuted flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-dark-primary" /> Net
          </span>
          <span
            className={`text-xs sm:text-sm font-bold truncate mt-1 ${
              netCentavos >= 0 ? 'text-dark-success' : 'text-dark-warning'
            }`}
          >
            {formatCentavosToPHP(netCentavos)}
          </span>
        </Card>

        {/* Legend so the grid markers are self-explanatory */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 col-span-3">
          <span className="flex items-center gap-1 text-[10px] text-light-textMuted dark:text-dark-textMuted">
            <span className="w-1.5 h-1.5 rounded-full bg-dark-success" /> Income
          </span>
          <span className="flex items-center gap-1 text-[10px] text-light-textMuted dark:text-dark-textMuted">
            <span className="w-1.5 h-1.5 rounded-full bg-dark-expense" /> Expense
          </span>
          <span className="flex items-center gap-1 text-[10px] text-light-textMuted dark:text-dark-textMuted">
            <span className="w-1.5 h-1.5 rounded-full bg-dark-primary" /> Bill
          </span>
          <span className="flex items-center gap-1 text-[10px] text-light-textMuted dark:text-dark-textMuted">
            <StickyNote className="w-3 h-3 text-dark-warning dark:text-dark-warning" /> Note
          </span>
        </div>

        {dayNotesError && (
          <div className="p-3 text-xs rounded-lg bg-light-warning/10 dark:bg-dark-warning/10 text-dark-warning dark:text-dark-warning border border-light-warning/20 dark:border-dark-warning/20 col-span-3">
            Day notes could not be loaded: {dayNotesError}
          </div>
        )}
      </div>

      {/* Main Grid & Side Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <Card variant="primary" padding="sm">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {WEEKDAYS.map((day) => (
                <span key={day} className="text-[11px] font-semibold text-light-textMuted dark:text-dark-textMuted py-1">
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="min-h-[52px] sm:min-h-[72px]" />;
                }
                const summary = dailyData[day.dateKey];
                return (
                  <CalendarDayCell
                    key={day.dateKey}
                    dayNum={day.dayNum}
                    dateKey={day.dateKey}
                    summary={summary}
                    isSelected={selectedDay === day.dateKey}
                    isToday={day.dateKey === todayKey}
                    hasNote={dayNotes.has(day.dateKey)}
                    onClick={() => setSelectedDay(day.dateKey)}
                  />
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Day Breakdown */}
        <div className="lg:col-span-1">
          {selectedDay ? (
            <CalendarDayDetail
              selectedDay={selectedDay}
              summary={dailyData[selectedDay]}
              onClose={() => setSelectedDay(null)}
              categoryMap={categoryMap}
              accountMap={accountMap}
              dayNote={selectedDay ? dayNotes.get(selectedDay) : undefined}
              onAddTransaction={(type) =>
                setAddTarget({ date: selectedDay, type })
              }
              onSaveDayNote={(notes) =>
                selectedDay ? handleSaveDayNote(selectedDay, notes) : Promise.resolve()
              }
            />
          ) : (
            <Card variant="primary" className="hidden sm:flex flex-col items-center justify-center p-8 text-center text-light-textMuted dark:text-dark-textMuted">
              <p className="text-xs">
                Select any day on the calendar to inspect transactions and scheduled bills.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Expense insight lives in the pie chart; the old category list was a
          duplicate of its legend, so it is no longer rendered. */}
      <CategoryPieChart
        breakdown={categoryBreakdown}
        totalExpenseCentavos={totalExpenseCentavos}
        currency={currency}
      />

      {addTarget && (
        <AddTransactionModal
          isOpen
          onClose={() => setAddTarget(null)}
          accounts={accounts}
          categories={categories}
          onAddTransaction={onAddTransaction}
          initialData={{ type: addTarget.type, date: addTarget.date }}
        />
      )}
    </ScreenContainer>
  );
};
