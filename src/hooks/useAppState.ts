import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Category } from '../types';
import { useAccounts } from '../features/accounts/useAccounts';
import { useTransactions } from '../features/transactions/useTransactions';
import { useRecurring } from '../features/recurring/useRecurring';
import { useGoals } from '../features/goals/useGoals';
import { usePartner } from '../features/partner/usePartner';

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-quickspend',
    userId: 'local',
    name: 'Quick Spend',
    type: 'expense',
    icon: 'zap',
    color: '#F97316',
    isDefault: true,
    updatedAt: ''
  },
  {
    id: 'cat-food',
    userId: 'local',
    name: 'Food & Dining',
    type: 'expense',
    icon: 'utensils',
    color: '#EF4444',
    isDefault: true,
    updatedAt: ''
  },
  {
    id: 'cat-groceries',
    userId: 'local',
    name: 'Groceries',
    type: 'expense',
    icon: 'shopping-cart',
    color: '#F97316',
    isDefault: true,
    updatedAt: ''
  },
  {
    id: 'cat-housing',
    userId: 'local',
    name: 'Housing & Utilities',
    type: 'expense',
    icon: 'home',
    color: '#F59E0B',
    isDefault: true,
    updatedAt: ''
  },
  {
    id: 'cat-transpo',
    userId: 'local',
    name: 'Transportation',
    type: 'expense',
    icon: 'car',
    color: '#10B981',
    isDefault: true,
    updatedAt: ''
  },
  {
    id: 'cat-salary',
    userId: 'local',
    name: 'Salary / Payroll',
    type: 'income',
    icon: 'briefcase',
    color: '#10B981',
    isDefault: true,
    updatedAt: ''
  },
  {
    id: 'cat-freelance',
    userId: 'local',
    name: 'Freelance & Business',
    type: 'income',
    icon: 'laptop',
    color: '#3B82F6',
    isDefault: true,
    updatedAt: ''
  }
];

export function useAppState() {
  const { user, refreshProfile } = useAuth();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;
  // Backend historically returned only `partnerId`; newer payloads also enrich
  // a `partner` object. Accept either so a missing enrichment never gates
  // shared-goal fetching off (the exact bug Android never hit because it reads
  // `/api/partners/status` directly).
  const isPartnerConnected = !!(user?.partner || user?.partnerId);
  const currency = user?.currency || 'PHP';

  const accountsState = useAccounts(isAuthenticated);

  const fetchGoalsRef = useRef<() => Promise<void>>(undefined);
  // Paying a recurring bill creates a transaction server-side, so any reload
  // triggered by a bill action must refresh transactions too — otherwise the new
  // expense never reaches the dashboard feed or the month totals.
  const fetchTransactionsRef = useRef<() => Promise<void>>(undefined);

  // Forward declaration for reloading all live queries
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      await Promise.all([
        accountsState.fetchAccounts(),
        apiFetch<{ categories: Category[] }>('/api/categories').then((res) => {
          if (res.categories && res.categories.length > 0) {
            setCategories(res.categories);
          }
        }),
        fetchTransactionsRef.current ? fetchTransactionsRef.current() : Promise.resolve(),
        fetchGoalsRef.current ? fetchGoalsRef.current() : Promise.resolve()
      ]);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accountsState.fetchAccounts]);

  const transactionsState = useTransactions(isAuthenticated, accountsState.adjustBalance, loadData);
  fetchTransactionsRef.current = transactionsState.fetchTransactions;

  const recurringState = useRecurring(isAuthenticated, loadData);

  const goalsState = useGoals(
    isAuthenticated,
    isPartnerConnected,
    accountsState.adjustBalance,
    loadData,
    accountsState.accounts
  );
  fetchGoalsRef.current = goalsState.fetchGoals;

  const partnerState = usePartner(refreshProfile, loadData);

  const handleSync = useCallback(async () => {
    if (isAuthenticated) {
      await refreshProfile();
      await loadData();
      await Promise.all([
        transactionsState.fetchTransactions(),
        recurringState.fetchRecurring(),
        goalsState.fetchGoals()
      ]);
    }
  }, [
    isAuthenticated,
    refreshProfile,
    loadData,
    transactionsState.fetchTransactions,
    recurringState.fetchRecurring,
    goalsState.fetchGoals
  ]);

  // Initial and reactive data sync
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      transactionsState.fetchTransactions();
      recurringState.fetchRecurring();
      goalsState.fetchGoals();
    }
  }, [isAuthenticated, isPartnerConnected]);

  return {
    user,
    accounts: accountsState.accounts,
    categories,
    transactions: transactionsState.transactions,
    recurringRules: recurringState.recurringRules,
    occurrences: recurringState.occurrences,
    goals: goalsState.goals,
    sharedGoals: goalsState.sharedGoals,
    loading,
    currency,
    loadData,
    handleSync,
    handleAddTransaction: transactionsState.handleAddTransaction,
    handleDeleteTransaction: transactionsState.handleDeleteTransaction,
    handleAddAccount: accountsState.handleAddAccount,
    handleAddRecurring: recurringState.handleAddRecurring,
    handlePayOccurrence: recurringState.handlePayOccurrence,
    handleSkipOccurrence: recurringState.handleSkipOccurrence,
    handleDeleteRule: recurringState.handleDeleteRule,
    handleAddGoal: goalsState.handleAddGoal,
    handleContribute: goalsState.handleContribute,
    handleGenerateInviteCode: partnerState.handleGenerateInviteCode,
    handleAcceptInviteCode: partnerState.handleAcceptInviteCode,
    handleUnlinkPartner: partnerState.handleUnlinkPartner
  };
}
