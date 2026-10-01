import React from 'react';
import { StickyNote } from 'lucide-react';
import { DailySummary } from './useCalendarData';
import { formatCentavosToPHP } from '../../shared/utils/currency';

export interface CalendarDayCellProps {
  dayNum: number;
  dateKey: string;
  summary?: DailySummary;
  isSelected: boolean;
  isToday: boolean;
  /** This day has a diary note, so the month grid can be scanned at a glance. */
  hasNote: boolean;
  onClick: () => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  dayNum,
  summary,
  isSelected,
  isToday,
  hasNote,
  onClick
}) => {
  const hasIncome = summary && summary.incomeCentavos > 0;
  const hasExpense = summary && summary.expenseCentavos > 0;
  const hasRecurring = summary && summary.recurringList.length > 0;

  return (
    <button
      onClick={onClick}
      className={`relative min-h-[52px] sm:min-h-[72px] p-1.5 flex flex-col justify-between rounded-lg border text-left transition-all min-w-0 overflow-hidden ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
          : isToday
            ? 'border-blue-300 dark:border-blue-700 bg-blue-50/20 dark:bg-blue-950/10'
            : 'border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-xs font-semibold ${
            isToday
              ? 'w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {dayNum}
        </span>
        {hasRecurring && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"
            title="Recurring bill scheduled"
          />
        )}
        {hasNote && (
          <StickyNote
            className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0"
            aria-label="Day note"
          />
        )}
      </div>

      <div className="w-full flex flex-col gap-0.5 mt-1 overflow-hidden">
        {hasIncome && (
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate leading-none">
            +{formatCentavosToPHP(summary!.incomeCentavos)}
          </span>
        )}
        {hasExpense && (
          <span className="text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400 truncate leading-none">
            -{formatCentavosToPHP(summary!.expenseCentavos)}
          </span>
        )}
      </div>
    </button>
  );
};
