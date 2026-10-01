import { useState, useCallback } from 'react';
import { apiFetch } from '../../services/api';
import { RecurringRule, WebProjectedOccurrence, RecurringFrequency } from '../../types';

export function useRecurring(isAuthenticated: boolean, onReloadData: () => Promise<void>) {
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [occurrences, setOccurrences] = useState<WebProjectedOccurrence[]>([]);

  const fetchRecurring = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const recRulesRes = await apiFetch<{ rules: RecurringRule[] }>('/api/recurring/rules');
      setRecurringRules(recRulesRes.rules);

      const now = new Date();
      const startStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`;
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      const endStr = `${endMonth.getFullYear()}-${(endMonth.getMonth() + 1).toString().padStart(2, '0')}-${endMonth.getDate().toString().padStart(2, '0')}`;

      const occRes = await apiFetch<{ occurrences: WebProjectedOccurrence[] }>(
        `/api/recurring/occurrences?startDate=${startStr}&endDate=${endStr}`
      );
      setOccurrences(occRes.occurrences);
    } catch (err) {
      console.error('Failed to load recurring data:', err);
    }
  }, [isAuthenticated]);

  const handleAddRecurring = async (data: {
    accountId: string;
    categoryId: string;
    type: 'expense' | 'income';
    amountCentavos: number;
    frequency: RecurringFrequency;
    intervalDays?: number;
    startDate: string;
    endDate?: string;
    maxOccurrences?: number;
    notes?: string;
  }) => {
    if (isAuthenticated) {
      await apiFetch('/api/recurring/rules', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await onReloadData();
    } else {
      const newRule: RecurringRule = {
        id: `rule-${Date.now()}`,
        userId: 'local',
        ...data,
        updatedAt: new Date().toISOString()
      };
      setRecurringRules((prev) => [...prev, newRule]);
      const occ: WebProjectedOccurrence = {
        ruleId: newRule.id,
        date: data.startDate,
        amountCentavos: data.amountCentavos,
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        notes: data.notes || 'Recurring rule',
        status: 'pending'
      };
      setOccurrences((prev) => [...prev, occ]);
    }
  };

  const handlePayOccurrence = async (ruleId: string, date: string, accountId?: string) => {
    if (isAuthenticated) {
      await apiFetch('/api/recurring/occurrences/pay', {
        method: 'POST',
        // `accountId` lets the user choose which account the payment is drawn
        // from; the backend falls back to the rule's own account when omitted.
        body: JSON.stringify({ ruleId, occurrenceDate: date, accountId })
      });
      await onReloadData();
      await fetchRecurring();
    } else {
      setOccurrences((prev) =>
        prev.map((o) => (o.ruleId === ruleId && o.date === date ? { ...o, status: 'paid' } : o))
      );
    }
  };

  const handleSkipOccurrence = async (ruleId: string, date: string) => {
    if (isAuthenticated) {
      await apiFetch('/api/recurring/occurrences/skip', {
        method: 'POST',
        body: JSON.stringify({ ruleId, occurrenceDate: date })
      });
      await onReloadData();
    } else {
      setOccurrences((prev) =>
        prev.map((o) => (o.ruleId === ruleId && o.date === date ? { ...o, status: 'skipped' } : o))
      );
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (isAuthenticated) {
      await apiFetch(`/api/recurring/rules/${ruleId}`, { method: 'DELETE' });
      await onReloadData();
    } else {
      setRecurringRules((prev) => prev.filter((r) => r.id !== ruleId));
      setOccurrences((prev) => prev.filter((o) => o.ruleId !== ruleId));
    }
  };

  return {
    recurringRules,
    occurrences,
    fetchRecurring,
    handleAddRecurring,
    handlePayOccurrence,
    handleSkipOccurrence,
    handleDeleteRule
  };
}
