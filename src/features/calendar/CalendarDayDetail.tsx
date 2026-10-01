import React, { useEffect, useState } from 'react';
import { DailySummary } from './useCalendarData';
import { Category, Account } from '../../types';
import { formatCentavosToPHP } from '../../shared/utils/currency';
import { formatDisplayDate } from '../../shared/utils/date';
import { getTransactionLabel } from '../../shared/utils/transactionLabel';
import { BottomSheet } from '../../shared/components/ui/BottomSheet';
import { Button, Card } from '../../shared/components/ui';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Repeat,
  StickyNote,
  Calendar as CalendarIcon
} from 'lucide-react';

export interface CalendarDayDetailProps {
  selectedDay: string | null;
  summary?: DailySummary;
  onClose: () => void;
  categoryMap: Map<string, Category>;
  accountMap: Map<string, Account>;
  /** Existing free-text note for this day, if any. */
  dayNote?: string;
  /** Opens the add form pre-set to this day and the given type. */
  onAddTransaction: (type: 'expense' | 'income') => void;
  /** Persists the note text for this day. */
  onSaveDayNote: (notes: string) => Promise<void>;
}

export const CalendarDayDetail: React.FC<CalendarDayDetailProps> = ({
  selectedDay,
  summary,
  onClose,
  categoryMap,
  accountMap,
  dayNote,
  onAddTransaction,
  onSaveDayNote
}) => {
  // Local draft so typing does not hit the API on every keystroke; re-seeded
  // whenever a different day is selected.
  const [noteDraft, setNoteDraft] = useState('');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    setNoteDraft(dayNote ?? '');
    setNoteStatus('idle');
  }, [selectedDay, dayNote]);

  const handleSaveNote = async (text: string) => {
    setNoteStatus('saving');
    try {
      await onSaveDayNote(text);
      setNoteStatus('saved');
    } catch {
      setNoteStatus('error');
    }
  };

  if (!selectedDay) return null;

  const content = (
    <div className="flex flex-col gap-4">
      {/* Add entry for the selected day */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAddTransaction('expense')}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60 transition-colors min-h-[44px]"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
        <button
          type="button"
          onClick={() => onAddTransaction('income')}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60 transition-colors min-h-[44px]"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Free-text note for the day, independent of any transaction */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/10 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
            Day Note
          </span>
        </div>

        <textarea
          value={noteDraft}
          onChange={(e) => {
            setNoteDraft(e.target.value);
            setNoteStatus('idle');
          }}
          rows={3}
          placeholder="e.g. Paid the electric bill, cashed the payday advance"
          className="w-full rounded-lg border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
        />

        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {noteStatus === 'saving' && 'Saving…'}
            {noteStatus === 'saved' && 'Note saved'}
            {noteStatus === 'error' && 'Could not save the note'}
            {noteStatus === 'idle' && 'Syncs across your devices'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNoteDraft('');
                handleSaveNote('');
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => handleSaveNote(noteDraft)}
              isLoading={noteStatus === 'saving'}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Save Note
            </Button>
          </div>
        </div>
      </div>

      {/* Daily totals */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total Income</span>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCentavosToPHP(summary?.incomeCentavos || 0)}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total Expense</span>
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            -{formatCentavosToPHP(summary?.expenseCentavos || 0)}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
          Transactions ({summary?.txList.length || 0})
        </h4>
        {summary?.txList.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No transactions recorded for this day.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {summary?.txList.map((tx) => {
              const category = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
              const account = accountMap.get(tx.accountId);
              const destAccount = tx.destinationAccountId
                ? accountMap.get(tx.destinationAccountId)
                : undefined;
              // Shared resolver keeps this sheet consistent with the app.
              const { title: txTitle, detail } = tx.type === 'transfer'
                ? { title: 'Transfer', detail: null }
                : getTransactionLabel(tx, category);

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50'
                          : tx.type === 'expense'
                            ? 'bg-red-100 text-red-600 dark:bg-red-950/50'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-950/50'
                      }`}
                    >
                      {tx.type === 'income' && <ArrowDownLeft className="w-4 h-4" />}
                      {tx.type === 'expense' && <ArrowUpRight className="w-4 h-4" />}
                      {tx.type === 'transfer' && <ArrowLeftRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {txTitle}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {account?.name} {destAccount ? `→ ${destAccount.name}` : ''}
                        {detail ? ` • ${detail}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold shrink-0 ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'expense'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatCentavosToPHP(tx.amountCentavos)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scheduled Recurring */}
      {summary && summary.recurringList.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5" />
            Scheduled Bills ({summary.recurringList.length})
          </h4>
          <div className="flex flex-col gap-2">
            {summary.recurringList.map((rec, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/10"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {rec.notes || 'Recurring Bill'}
                  </p>
                  <span className="text-[10px] uppercase font-semibold text-purple-600 dark:text-purple-400">
                    {rec.status}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {formatCentavosToPHP(rec.amountCentavos)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (Bottom Sheet) */}
      <BottomSheet
        isOpen={Boolean(selectedDay)}
        onClose={onClose}
        title={formatDisplayDate(selectedDay)}
      >
        {content}
      </BottomSheet>

      {/* Desktop Panel */}
      <div className="hidden sm:block">
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60 mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              {formatDisplayDate(selectedDay)}
            </h3>
          </div>
          {content}
        </Card>
      </div>
    </>
  );
};
