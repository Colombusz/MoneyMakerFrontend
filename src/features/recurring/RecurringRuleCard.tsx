import React from 'react';
import { Trash2 } from 'lucide-react';
import { RecurringRule, Account, Category } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { formatDisplayDate } from '../../shared/utils/date';

interface RecurringRuleCardProps {
  rule: RecurringRule;
  account?: Account;
  category?: Category;
  currency: string;
  onDelete: (ruleId: string) => Promise<void>;
}

export const RecurringRuleCard: React.FC<RecurringRuleCardProps> = ({
  rule,
  account,
  currency,
  onDelete
}) => {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            {rule.notes || 'Recurring rule'}
          </h4>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 capitalize">
              {rule.frequency}
            </span>
            <span className="text-xs text-slate-400">• {account?.name}</span>
          </div>
        </div>

        <button
          onClick={() => onDelete(rule.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          title="Delete rule"
          aria-label="Delete rule"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-500">Started: {formatDisplayDate(rule.startDate)}</span>
        <span className="text-base font-bold text-slate-900 dark:text-white">
          {formatCentavos(rule.amountCentavos, currency)}
        </span>
      </div>
    </div>
  );
};
