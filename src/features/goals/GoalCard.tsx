import React from 'react';
import { PiggyBank, Calendar as CalendarIcon, Clock, Wallet } from 'lucide-react';
import { Goal, Account } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { formatDisplayDate } from '../../shared/utils/date';
import { ProgressBar, Button } from '../../shared/components/ui';

interface GoalCardProps {
  goal: Goal;
  linkedAccount?: Account | null;
  currency: string;
  onContribute: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  linkedAccount,
  currency,
  onContribute
}) => {
  const saved = goal.totalSavedCentavos || 0;
  const target = goal.targetAmountCentavos;
  const percentage =
    goal.percentage !== undefined
      ? goal.percentage
      : Math.min(100, Math.round((saved / target) * 100)) || 0;
  const remaining =
    goal.remainingCentavos !== undefined ? goal.remainingCentavos : Math.max(0, target - saved);
  const isCompleted = percentage >= 100;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{goal.name}</h3>
              {goal.isShared && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                  Shared
                </span>
              )}
            </div>

            {linkedAccount && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <Wallet className="w-3.5 h-3.5" />
                <span>Linked: {linkedAccount.name}</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <ProgressBar
            percentage={percentage}
            color={isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}
            height="md"
          />
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            <span>Saved: {formatCentavos(saved, currency)}</span>
            <span>Target: {formatCentavos(target, currency)}</span>
          </div>
        </div>

        {/* Completion Pace / Target Date Info */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Remaining:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCentavos(remaining, currency)}
            </span>
          </div>

          {goal.targetDate && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Target Date:
              </span>
              <span>{formatDisplayDate(goal.targetDate)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Pace Projection:
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {isCompleted
                ? 'Goal Completed!'
                : goal.projectedCompletionDate
                  ? `Projected: ${formatDisplayDate(goal.projectedCompletionDate)}`
                  : 'Contribute to calculate pace'}
            </span>
          </div>
        </div>
      </div>

      {/* Contribute Action */}
      <Button
        onClick={() => onContribute(goal)}
        disabled={isCompleted}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
      >
        <PiggyBank className="w-4 h-4" />
        <span>{isCompleted ? 'Goal Completed 🎉' : 'Record Contribution'}</span>
      </Button>
    </div>
  );
};
