import { useState, useCallback } from 'react';
import { apiFetch } from '../../services/api';
import { Transaction, TransactionType } from '../../types';

export function useTransactions(
  isAuthenticated: boolean,
  onAdjustBalance: (accountId: string, delta: number) => void,
  onReloadData: () => Promise<void>
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const txRes = await apiFetch<{ transactions: Transaction[] }>('/api/transactions?limit=100');
      setTransactions(txRes.transactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  }, [isAuthenticated]);

  const handleAddTransaction = async (data: {
    type: TransactionType;
    accountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    amountCentavos: number;
    date: string;
    notes?: string;
    source?: string;
  }) => {
    if (isAuthenticated) {
      if (data.type === 'transfer' && data.destinationAccountId) {
        await apiFetch('/api/accounts/transfer', {
          method: 'POST',
          body: JSON.stringify({
            fromAccountId: data.accountId,
            toAccountId: data.destinationAccountId,
            amountCentavos: data.amountCentavos,
            date: data.date,
            notes: data.notes
          })
        });
      } else {
        await apiFetch('/api/transactions', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
      await onReloadData();
    } else {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        userId: 'local',
        accountId: data.accountId,
        type: data.type,
        amountCentavos: data.amountCentavos,
        categoryId: data.categoryId,
        destinationAccountId: data.destinationAccountId,
        date: data.date,
        notes: data.notes,
        source: data.source,
        updatedAt: new Date().toISOString()
      };
      setTransactions((prev) => [newTx, ...prev]);

      if (data.type === 'income') {
        onAdjustBalance(data.accountId, data.amountCentavos);
      } else if (data.type === 'expense') {
        onAdjustBalance(data.accountId, -data.amountCentavos);
      } else if (data.type === 'transfer') {
        onAdjustBalance(data.accountId, -data.amountCentavos);
        if (data.destinationAccountId) {
          onAdjustBalance(data.destinationAccountId, data.amountCentavos);
        }
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (isAuthenticated) {
      await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' });
      await onReloadData();
    } else {
      const target = transactions.find((t) => t.id === id);
      if (!target) return;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (target.type === 'income') {
        onAdjustBalance(target.accountId, -target.amountCentavos);
      } else if (target.type === 'expense') {
        onAdjustBalance(target.accountId, target.amountCentavos);
      } else if (target.type === 'transfer') {
        onAdjustBalance(target.accountId, target.amountCentavos);
        if (target.destinationAccountId) {
          onAdjustBalance(target.destinationAccountId, -target.amountCentavos);
        }
      }
    }
  };

  return {
    transactions,
    setTransactions,
    fetchTransactions,
    handleAddTransaction,
    handleDeleteTransaction
  };
}
