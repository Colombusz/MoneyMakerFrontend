import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SharedGoal } from '../../types';
import { SharedAccount } from './useSharedAccounts';
import { toDayKey, formatDisplayDate } from '../../shared/utils/date';
import { formatCentavos } from '../../shared/utils/currency';
import { Card } from '../../shared/components/ui';

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
interface DayItem { kind: string; label: string; amount: number; positive: boolean; }

interface Props { sharedGoals: SharedGoal[]; sharedAccounts: SharedAccount[]; currency: string; }

export const SharedCalendarView: React.FC<Props> = ({ sharedGoals, sharedAccounts, currency }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const monthPrefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;
  const todayKey = toDayKey(new Date());
  const dailyData = useMemo(() => {
    const map: Record<string, DayItem[]> = {};
    const push = (dayKey: string, item: DayItem) => {
      if (!dayKey || !dayKey.startsWith(monthPrefix)) return;
      if (!map[dayKey]) map[dayKey] = [];
      map[dayKey].push(item);
    };
    for (const g of sharedGoals) {
      for (const c of g.recentContributions ?? []) {
        push(toDayKey(c.date), { kind: 'Goal contribution', label: `${g.name} - ${c.contributorName}`, amount: c.amountCentavos, positive: true });
      }
    }
    for (const a of sharedAccounts) {
      for (const m of a.recentMovements ?? []) {
        push(toDayKey(m.date), { kind: m.type === 'deposit' ? 'Account deposit' : 'Account expense', label: `${a.name} - ${m.userName ?? 'Partner'}${m.notes ? ` (${m.notes})` : ''}`, amount: m.amountCentavos, positive: m.type === 'deposit' });
      }
    }
    return map;
  }, [sharedGoals, sharedAccounts, monthPrefix]);
  const calendarDays = useMemo(() => {
    const days: Array<{ dateKey: string; dayNum: number } | null> = [];
    const firstDow = new Date(year, month, 1).getDay();
    const dim = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDow; i++) days.push(null);
    for (let d = 1; d <= dim; d++) days.push({ dateKey: `${monthPrefix}-${String(d).padStart(2, '0')}`, dayNum: d });
    return days;
  }, [year, month, monthPrefix]);
  const selectedItems = selectedDay ? dailyData[selectedDay] ?? [] : [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); }} aria-label="Previous month" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft className="w-4 h-4" /></button>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{monthName} {year}</h4>
          <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); }} aria-label="Next month" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <Card padding="sm">
            <div className="grid grid-cols-7 gap-1 text-center mb-1">{WEEKDAYS.map((d) => (<span key={d} className="text-[11px] font-semibold text-gray-400 py-1">{d}</span>))}</div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="min-h-[52px] sm:min-h-[72px]" />;
                const items = dailyData[day.dateKey];
                const count = items?.length ?? 0;
                const isSel = selectedDay === day.dateKey;
                return (
                  <button key={day.dateKey} onClick={() => setSelectedDay(day.dateKey)}
                    className={`min-h-[52px] sm:min-h-[72px] p-1 rounded-lg border text-left transition-colors ${isSel ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40' : 'border-slate-100 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-700'} ${day.dateKey === todayKey ? 'ring-1 ring-purple-400' : ''}`}>
                    <span className={`text-xs font-bold ${day.dateKey === todayKey ? 'text-purple-600 dark:text-purple-300' : 'text-slate-600 dark:text-slate-300'}`}>{day.dayNum}</span>
                    {count > 0 && (<span className="mt-1 block text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 w-fit">{count} event{count > 1 ? 's' : ''}</span>)}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          {selectedDay ? (
            <Card>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">{formatDisplayDate(selectedDay)}</h5>
                <button onClick={() => setSelectedDay(null)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Clear</button>
              </div>
              {selectedItems.length === 0 ? (<p className="text-xs text-slate-500 dark:text-slate-400">No shared activity on this day.</p>) : (
                <div className="space-y-1.5">
                  {selectedItems.map((it, i) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center gap-2">
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">{it.kind}</div><div className="text-slate-500 dark:text-slate-400">{it.label}</div></div>
                      <span className={`font-semibold whitespace-nowrap ${it.positive ? 'text-emerald-600' : 'text-rose-600'}`}>{it.positive ? '+' : '-'}{formatCentavos(it.amount, currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card className="hidden sm:flex flex-col items-center justify-center p-8 text-center text-gray-400"><p className="text-xs">Select any day to inspect shared goal contributions and shared-account movements.</p></Card>
          )}
        </div>
      </div>
    </div>
  );
};
