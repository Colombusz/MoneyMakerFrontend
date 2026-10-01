import React from 'react';
import { Repeat, CheckCircle2, SkipForward } from 'lucide-react';
import { WebProjectedOccurrence, Category, Account } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { formatDisplayDate } from '../../shared/utils/date';
import { Button } from '../../shared/components/ui';

interface ProjectedOccurrenceItemProps {
  item: WebProjectedOccurrence;
  category?: Category;
  account?: Account;
  currency: string;
  // Paying opens a follow-up sheet to choose the account, so this only selects
  // the occurrence; the actual payment is submitted from that sheet.
  onPay: (ruleId: string, date: string) => void;
  onSkip: (ruleId: string, date: string) => void;
}

export const ProjectedOccurrenceItem: React.FC<ProjectedOccurrenceItemProps> = ({
  item,
  category,
  account,
  currency,
  onPay,
  onSkip
}) => {
  const isPaid = item.status === 'paid';
  const isSkipped = item.status === 'skipped';

  return (
    <div
      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
        isPaid
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
          : isSkipped
            ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isPaid
              ? 'bg-emerald-100 text-emerald-600'
              : isSkipped
                ? 'bg-slate-200 text-slate-500'
                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
          }`}
        >
          <Repeat className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              {item.notes || 'Recurring Bill'}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isPaid
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  : isSkipped
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {item.status.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">Due: {formatDisplayDate(item.date)}</span>
            <span>•</span>
            <span>{account?.name}</span>
            {category && (
              <>
                <span>•</span>
                <span>{category.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-700/60">
        <span className="text-base font-bold text-slate-900 dark:text-white">
          {formatCentavos(item.amountCentavos, currency)}
        </span>

        {!isPaid && !isSkipped && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => onPay(item.ruleId, item.date)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pay</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSkip(item.ruleId, item.date)}
              className="flex items-center gap-1"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
