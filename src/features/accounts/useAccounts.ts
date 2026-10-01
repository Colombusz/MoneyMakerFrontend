import { useState, useCallback } from 'react';
import { apiFetch } from '../../services/api';
import { Account, AccountType } from '../../types';

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-cash',
    userId: 'local',
    name: 'Cash',
    type: 'cash',
    startingBalanceCentavos: 0,
    currentBalanceCentavos: 0,
    isArchived: false,
    updatedAt: ''
  },
  {
    id: 'acc-payroll',
    userId: 'local',
    name: 'Payroll',
    type: 'payroll',
    startingBalanceCentavos: 5000000,
    currentBalanceCentavos: 5000000,
    isArchived: false,
    updatedAt: ''
  },
  {
    id: 'acc-savings',
    userId: 'local',
    name: 'Savings',
    type: 'savings',
    startingBalanceCentavos: 2500000,
    currentBalanceCentavos: 2500000,
    isArchived: false,
    updatedAt: ''
  },
  {
    id: 'acc-maribank',
    userId: 'local',
    name: 'Maribank Goals',
    type: 'goals',
    startingBalanceCentavos: 1000000,
    currentBalanceCentavos: 1000000,
    isArchived: false,
    updatedAt: ''
  }
];

export function useAccounts(isAuthenticated: boolean) {
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);

  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const accRes = await apiFetch<{ accounts: Account[] }>('/api/accounts');
      setAccounts(accRes.accounts);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }, [isAuthenticated]);

  const handleAddAccount = async (data: {
    name: string;
    type: AccountType;
    startingBalanceCentavos: number;
  }) => {
    if (isAuthenticated) {
      await apiFetch('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await fetchAccounts();
    } else {
      const newAcc: Account = {
        id: `acc-${Date.now()}`,
        userId: 'local',
        name: data.name,
        type: data.type,
        startingBalanceCentavos: data.startingBalanceCentavos,
        currentBalanceCentavos: data.startingBalanceCentavos,
        isArchived: false,
        updatedAt: new Date().toISOString()
      };
      setAccounts((prev) => [...prev, newAcc]);
    }
  };

  const adjustBalance = (accountId: string, deltaCentavos: number) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, currentBalanceCentavos: acc.currentBalanceCentavos + deltaCentavos }
          : acc
      )
    );
  };

  return {
    accounts,
    setAccounts,
    fetchAccounts,
    handleAddAccount,
    adjustBalance
  };
}
