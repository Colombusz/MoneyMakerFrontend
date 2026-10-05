import React from 'react';
import { Wallet, Layers, Plus, Zap, Banknote, TrendingUp } from 'lucide-react';
import { Account, Transaction, Category } from '../types';
import { formatCentavos } from '../shared/utils/currency';
import { NetWorthBanner } from '../features/dashboard/NetWorthBanner';
import { RecentTransactionsList } from '../features/dashboard/RecentTransactionsList';
import { Card, Button, Pill } from '../shared/components/ui';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onOpenAddTransaction: () => void;
  onOpenAddAccount: () => void;
  onDeleteTransaction: (id: string) => Promise<void>;
  onOpenCashQuickSpend?: (account: Account) => void;
  onNavigateStocks?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  categories,
  currency,
  onOpenAddTransaction,
  onOpenAddAccount,
  onDeleteTransaction,
  onOpenCashQuickSpend,
  onNavigateStocks
}) => {
  const totalBalanceCentavos = accounts.reduce((acc, a) => acc + a.currentBalanceCentavos, 0);

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  const currentMonthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonthPrefix)
  );
  const monthIncomeCentavos = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amountCentavos, 0);
  const monthExpenseCentavos = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amountCentavos, 0);
  const monthNetCentavos = monthIncomeCentavos - monthExpenseCentavos;

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Net Worth Banner */}
      <NetWorthBanner
        accountsCount={accounts.length}
        totalBalanceCentavos={totalBalanceCentavos}
        monthIncomeCentavos={monthIncomeCentavos}
        monthExpenseCentavos={monthExpenseCentavos}
        monthNetCentavos={monthNetCentavos}
        currency={currency}
      />

      {/* US Stocks Monitoring & Prediction Highlight Card */}
      {onNavigateStocks && (
        <div
          onClick={onNavigateStocks}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-500/30 hover:border-emerald-500 transition-all cursor-pointer shadow-subtle dark:shadow-subtle-dark hover:-translate-y-0.5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-light-text dark:text-dark-text">
                    US Stocks Monitoring & Prediction
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    Alpha Vantage Live
                  </span>
                </div>
                <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-0.5">
                  Track real-time quotes, interactive price trend forecasts, and multi-factor quantitative AI predictions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold mr-2">
                <span className="px-2 py-1 rounded-lg bg-light-surface/80 dark:bg-dark-surface/80 border border-light-border dark:border-dark-border text-emerald-600 dark:text-emerald-400">
                  AAPL $333.69 (+1.02%)
                </span>
                <span className="px-2 py-1 rounded-lg bg-light-surface/80 dark:bg-dark-surface/80 border border-light-border dark:border-dark-border text-emerald-600 dark:text-emerald-400">
                  NVDA $137.45 (+1.89%)
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateStocks();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all shrink-0"
              >
                <span>Explore Stocks</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-dark-primary" />
            <h2 className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text">
              My Accounts
            </h2>
          </div>
          <Button onClick={onOpenAddAccount} variant="ghost" size="sm" className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>New Account</span>
          </Button>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((acc) => {
            const isCash = acc.type === 'cash' || acc.name.toLowerCase() === 'cash';
            return (
              <div
                key={acc.id}
                onClick={() => {
                  if (isCash && onOpenCashQuickSpend) {
                    onOpenCashQuickSpend(acc);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all ${
                  isCash
                    ? 'bg-light-card dark:bg-dark-card border-dark-expense/40 hover:border-dark-expense hover:shadow-md cursor-pointer ring-1 ring-dark-expense/20'
                    : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:border-light-border/50 dark:hover:border-dark-border/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-light-text dark:text-dark-text text-base">
                      {acc.name}
                    </h3>
                    {isCash ? (
                      <Pill variant="expense" size="sm" className="mt-1">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Quick Spend
                        </span>
                      </Pill>
                    ) : (
                      <Pill variant="secondary" size="sm" className="mt-1 capitalize">
                        {acc.type}
                      </Pill>
                    )}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isCash
                        ? 'bg-dark-expenseLight dark:bg-dark-expenseLight text-dark-expense dark:text-dark-expense'
                        : 'bg-dark-primaryLight dark:bg-dark-primaryLight text-dark-primary dark:text-dark-primary'
                    }`}
                  >
                    {isCash ? <Banknote className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-light-textMuted dark:text-dark-textMuted">Current Balance</span>
                  <div className="text-xl font-bold text-light-text dark:text-dark-text">
                    {formatCentavos(acc.currentBalanceCentavos, currency)}
                  </div>
                  {isCash && (
                    <span className="text-[10px] font-semibold text-dark-expense dark:text-dark-expense mt-1 inline-flex items-center gap-1">
                      Tap card to log quick spend →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-dark-primary" />
            <h2 className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text">
              Recent Transactions
            </h2>
          </div>
          <Button onClick={onOpenAddTransaction} variant="primary" size="sm" className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </Button>
        </div>

        <RecentTransactionsList
          transactions={transactions}
          accountMap={accountMap}
          categoryMap={categoryMap}
          currency={currency}
          onOpenAddTransaction={onOpenAddTransaction}
          onDeleteTransaction={onDeleteTransaction}
        />
      </div>
    </div>
  );
};
