import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2 } from 'lucide-react';
import { Transaction, Account, Category } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { formatDisplayDate } from '../../shared/utils/date';
import { getTransactionLabel } from '../../shared/utils/transactionLabel';
import { EmptyState } from '../../shared/components/ui';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  accountMap: Map<string, Account>;
  categoryMap: Map<string, Category>;
  currency: string;
  onOpenAddTransaction: () => void;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  transactions,
  accountMap,
  categoryMap,
  currency,
  onOpenAddTransaction,
  onDeleteTransaction
}) => {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions recorded yet"
        description="Record income, expenses, or transfers to monitor your cashflow."
        actionLabel="Record First Transaction"
        onAction={onOpenAddTransaction}
      />
    );
  }

  return (
    <div className="space-y-2">
      {transactions.slice(0, 15).map((t) => {
        const account = accountMap.get(t.accountId);
        const destAccount = t.destinationAccountId ? accountMap.get(t.destinationAccountId) : null;
        const category = t.categoryId ? categoryMap.get(t.categoryId) : null;

        const isIncome = t.type === 'income';
        const isExpense = t.type === 'expense';
        const isTransfer = t.type === 'transfer';

        // Same resolver the app uses, so a record never shows one name here and
        // a different one on the phone.
        const { title, detail } = getTransactionLabel(t, category ?? undefined);
        const displayTitle = isTransfer
          ? `Transfer: ${account?.name || 'Account'} → ${destAccount?.name || 'Account'}`
          : title;

        return (
          <div
            key={t.id}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 transition-colors hover:border-slate-300 dark:hover:border-slate-600"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isIncome
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : isExpense
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                }`}
              >
                {isIncome && <ArrowDownLeft className="w-5 h-5" />}
                {isExpense && <ArrowUpRight className="w-5 h-5" />}
                {isTransfer && <ArrowLeftRight className="w-5 h-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {displayTitle}
                  </span>
                  {isTransfer && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                      Transfer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                  <span>{formatDisplayDate(t.date)}</span>
                  {account && (
                    <>
                      <span>•</span>
                      <span>{account.name}</span>
                    </>
                  )}
                  {detail && (
                    <>
                      <span>•</span>
                      <span className="truncate italic">{detail}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`text-sm sm:text-base font-bold ${
                  isIncome
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isExpense
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {isIncome ? '+' : isExpense ? '-' : ''}
                {formatCentavos(t.amountCentavos, currency)}
              </span>

              <button
                onClick={() => onDeleteTransaction(t.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                title="Delete transaction"
                aria-label="Delete transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
