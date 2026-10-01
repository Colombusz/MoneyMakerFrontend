import React from 'react';
import { Wallet, Target, CheckCircle2, CalendarDays } from 'lucide-react';

export type PartnerTab = 'accounts' | 'goals' | 'finished' | 'calendar';

const TABS: Array<{ id: PartnerTab; label: string; icon: React.ReactNode }> = [
  { id: 'accounts', label: 'Accounts', icon: <Wallet className="w-4 h-4" /> },
  { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
  { id: 'finished', label: 'Finished', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> }
];

export const PartnerSubNav: React.FC<{
  active: PartnerTab;
  onChange: (tab: PartnerTab) => void;
  counts?: Partial<Record<PartnerTab, number>>;
}> = ({ active, onChange, counts }) => (
  <div
    role="tablist"
    aria-label="Partner sections"
    className="flex gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto"
  >
    {TABS.map((t) => {
      const isActive = t.id === active;
      const count = counts?.[t.id];
      return (
        <button
          key={t.id}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(t.id)}
          className={`flex-1 min-w-[104px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            isActive
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-800'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
          }`}
        >
          {t.icon}
          <span>{t.label}</span>
          {typeof count === 'number' && count > 0 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
