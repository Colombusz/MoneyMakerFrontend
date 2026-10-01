import React from 'react';
import { PiggyBank, CheckCircle2 } from 'lucide-react';
import { SharedGoal, UserProfile } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { formatDisplayDate } from '../../shared/utils/date';
import { ProgressBar, Button } from '../../shared/components/ui';

interface SharedGoalCardProps {
  goal: SharedGoal;
  user: UserProfile;
  currency: string;
  onContribute: (goal: SharedGoal) => void;
  hideContribute?: boolean;
}

export const SharedGoalCard: React.FC<SharedGoalCardProps> = ({ goal, user, currency, onContribute, hideContribute }) => {
  const percentage = Math.min(100, Math.round((goal.totalSavedCentavos / goal.targetAmountCentavos) * 100)) || 0;
  const isComplete = percentage >= 100 || goal.isArchived || hideContribute === true;
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{goal.name}</h4>
          <span className="text-xs text-slate-400">
            Target: {formatCentavos(goal.targetAmountCentavos, currency)}
            {goal.targetDate ? ` \u2022 Due ${formatDisplayDate(goal.targetDate)}` : ''}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{percentage}%</span>
          {isComplete && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{goal.isArchived ? 'Archived' : 'Goal Completed'}</span>
            </span>
          )}
        </div>
      </div>
      <div>
        <ProgressBar percentage={percentage} color="bg-purple-600" />
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1.5">
          <span>Total Saved: {formatCentavos(goal.totalSavedCentavos, currency)}</span>
          <span>Remaining: {formatCentavos(goal.remainingCentavos, currency)}</span>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
        <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider block mb-2">Contribution Breakdown</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {goal.members.map((m) => {
            const isSelf = m.userId === user.id;
            return (
              <div key={m.userId} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/60">
                <span className="text-slate-500 block truncate">{isSelf ? 'You' : m.name}</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{formatCentavos(m.totalContributedCentavos, currency)}</span>
              </div>
            );
          })}
        </div>
      </div>
      {goal.recentContributions && goal.recentContributions.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Recent Contributions</span>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {goal.recentContributions.slice(0, 5).map((c) => (
              <div key={c.id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">{c.contributorName}{c.notes ? ` (${c.notes})` : ''}</span>
                <span className="font-semibold text-emerald-600">+{formatCentavos(c.amountCentavos, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {!isComplete && (
        <Button onClick={() => onContribute(goal)} className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white flex items-center justify-center gap-2">
          <PiggyBank className="w-4 h-4" />
          <span>Contribute to Shared Goal</span>
        </Button>
      )}
    </div>
  );
};
