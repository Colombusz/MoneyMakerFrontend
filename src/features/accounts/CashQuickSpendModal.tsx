import React, { useState, useEffect } from 'react';
import { Zap, Wallet } from 'lucide-react';
import { Account, Category } from '../../types';
import { formatCentavos, parseToCentavos } from '../../shared/utils/currency';
import { formatDateToISO } from '../../shared/utils/date';
import { Modal, Button } from '../../shared/components/ui';
import { TransactionFormData } from '../transactions/TransactionForm';

export interface CashQuickSpendModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  categories: Category[];
  currency?: string;
  onAddTransaction: (data: TransactionFormData) => Promise<void>;
}

const QUICK_AMOUNTS = [
  { label: '₱15 (Jeepney)', amount: 15 },
  { label: '₱20 (Fare)', amount: 20 },
  { label: '₱50 (Snack)', amount: 50 },
  { label: '₱100 (Meal)', amount: 100 },
];

export const CashQuickSpendModal: React.FC<CashQuickSpendModalProps> = ({
  isOpen,
  onClose,
  account,
  categories,
  currency = 'PHP',
  onAddTransaction,
}) => {
  const [spentInput, setSpentInput] = useState('');
  const [remainingInput, setRemainingInput] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => formatDateToISO(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentBalanceCentavos = account?.currentBalanceCentavos || 0;

  // Find or fallback to Quick Spend category
  const quickSpendCategory =
    categories.find((c) => c.name.toLowerCase() === 'quick spend') ||
    categories.find((c) => c.isDefault) ||
    categories[0];

  useEffect(() => {
    if (isOpen) {
      setSpentInput('');
      const initialRemaining = (currentBalanceCentavos / 100).toFixed(2);
      setRemainingInput(initialRemaining);
      setNote('');
      setDate(formatDateToISO(new Date()));
      setError(null);
    }
  }, [isOpen, currentBalanceCentavos]);

  const handleSpentChange = (val: string) => {
    setSpentInput(val);
    setError(null);
    const parsedCentavos = parseToCentavos(val);
    const newRemaining = Math.max(0, currentBalanceCentavos - parsedCentavos);
    setRemainingInput((newRemaining / 100).toFixed(2));
  };

  const handleRemainingChange = (val: string) => {
    setRemainingInput(val);
    setError(null);
    const parsedCentavos = parseToCentavos(val);
    const diff = currentBalanceCentavos - parsedCentavos;
    if (diff >= 0) {
      setSpentInput((diff / 100).toFixed(2));
    } else {
      setSpentInput('0.00');
    }
  };

  const handleAddQuickAmount = (amountPhp: number) => {
    const currentSpentCentavos = parseToCentavos(spentInput);
    const nextSpentCentavos = currentSpentCentavos + amountPhp * 100;
    const nextSpentVal = (nextSpentCentavos / 100).toFixed(2);
    setSpentInput(nextSpentVal);
    const nextRemaining = Math.max(0, currentBalanceCentavos - nextSpentCentavos);
    setRemainingInput((nextRemaining / 100).toFixed(2));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    const spentCentavos = parseToCentavos(spentInput);
    if (spentCentavos <= 0) {
      setError('Please enter an amount spent.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onAddTransaction({
        type: 'expense',
        amountCentavos: spentCentavos,
        accountId: account.id,
        categoryId: quickSpendCategory?.id,
        notes: note.trim() || 'Quick spend',
        date,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record quick spend transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!account) return null;

  const spentCentavos = parseToCentavos(spentInput);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚡ Cash Quick Spend" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info card comparing first balance to new balance */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  Current Cash Balance
                </span>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {formatCentavos(currentBalanceCentavos, currency)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-orange-500" />
              <span>Quick Spend</span>
            </div>
          </div>
        </div>

        {/* Dual Linked Inputs: Spent vs Remaining */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="cash-spent-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              How much did you spend?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">₱</span>
              <input
                id="cash-spent-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={spentInput}
                onChange={(e) => handleSpentChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="cash-remaining-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Or New Remaining Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">₱</span>
              <input
                id="cash-remaining-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={remainingInput}
                onChange={(e) => handleRemainingChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Amount Suggestion Chips */}
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
            Quick Add
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_AMOUNTS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleAddQuickAmount(item.amount)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                +{item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note / Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Jeepney fare, snack, street food"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || spentCentavos <= 0}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            {loading ? 'Logging...' : `Log ${formatCentavos(spentCentavos, currency)} Expense`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
