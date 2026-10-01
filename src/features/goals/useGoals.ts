import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Goal, SharedGoal, Account } from '../../types';

export function useGoals(
  isAuthenticated: boolean,
  isPartnerConnected: boolean,
  onAdjustBalance: (accountId: string, delta: number) => void,
  onReloadData: () => Promise<void>,
  accounts: Account[] = []
) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([]);

  const fetchGoals = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const goalsRes = await apiFetch<{ goals: Goal[] }>('/api/goals');
      setGoals(goalsRes.goals);

      if (isPartnerConnected) {
        const sharedRes = await apiFetch<{ sharedGoals: SharedGoal[] }>(
          '/api/partners/shared-goals'
        );
        setSharedGoals(sharedRes.sharedGoals);
      } else {
        setSharedGoals([]);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  }, [isAuthenticated, isPartnerConnected]);

  // Keep local goals metrics reactive to changes in linked account balances
  useEffect(() => {
    if (isAuthenticated) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (!g.linkedAccountId) return g;
        const linkedAcc = accounts.find((a) => a.id === g.linkedAccountId);
        const linkedBalance = linkedAcc ? Math.max(0, linkedAcc.currentBalanceCentavos) : 0;
        const contributions = g.contributionsTotalCentavos || 0;
        const totalSavedCentavos = contributions + linkedBalance;
        const remainingCentavos = Math.max(0, g.targetAmountCentavos - totalSavedCentavos);
        const percentage =
          g.targetAmountCentavos > 0
            ? Math.min(100, Math.round((totalSavedCentavos / g.targetAmountCentavos) * 100))
            : 100;

        if (
          g.totalSavedCentavos === totalSavedCentavos &&
          g.remainingCentavos === remainingCentavos &&
          g.percentage === percentage
        ) {
          return g;
        }

        return {
          ...g,
          totalSavedCentavos,
          remainingCentavos,
          percentage
        };
      })
    );
  }, [accounts, isAuthenticated]);

  const handleAddGoal = async (data: {
    name: string;
    targetAmountCentavos: number;
    targetDate?: string;
    linkedAccountId?: string;
    isShared?: boolean;
  }) => {
    if (isAuthenticated) {
      if (data.isShared) {
        await apiFetch('/api/partners/shared-goals', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } else {
        await apiFetch('/api/goals', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
      await onReloadData();
      await fetchGoals();
    } else {
      const linkedAcc = data.linkedAccountId
        ? accounts.find((a) => a.id === data.linkedAccountId)
        : null;
      const linkedBalance = linkedAcc ? Math.max(0, linkedAcc.currentBalanceCentavos) : 0;
      const totalSavedCentavos = linkedBalance;
      const remainingCentavos = Math.max(0, data.targetAmountCentavos - totalSavedCentavos);
      const percentage =
        data.targetAmountCentavos > 0
          ? Math.min(100, Math.round((totalSavedCentavos / data.targetAmountCentavos) * 100))
          : 100;

      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        userId: 'local',
        name: data.name,
        targetAmountCentavos: data.targetAmountCentavos,
        targetDate: data.targetDate,
        linkedAccountId: data.linkedAccountId,
        isShared: false,
        contributionsTotalCentavos: 0,
        totalSavedCentavos,
        remainingCentavos,
        percentage,
        updatedAt: new Date().toISOString()
      };
      setGoals((prev) => [...prev, newGoal]);
    }
  };

  const handleContribute = async (params: {
    goalId: string;
    isShared: boolean;
    amountCentavos: number;
    accountId: string;
    date: string;
    notes?: string;
  }) => {
    if (isAuthenticated) {
      if (params.isShared) {
        await apiFetch(`/api/partners/shared-goals/${params.goalId}/contribute`, {
          method: 'POST',
          body: JSON.stringify(params)
        });
      } else {
        await apiFetch(`/api/goals/${params.goalId}/contribute`, {
          method: 'POST',
          body: JSON.stringify(params)
        });
      }
      await onReloadData();
      await fetchGoals();
    } else {
      onAdjustBalance(params.accountId, -params.amountCentavos);
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === params.goalId) {
            const newContributions = (g.contributionsTotalCentavos || 0) + params.amountCentavos;
            const linkedAcc = g.linkedAccountId
              ? accounts.find((a) => a.id === g.linkedAccountId)
              : null;
            let linkedBalance = linkedAcc ? Math.max(0, linkedAcc.currentBalanceCentavos) : 0;
            if (g.linkedAccountId && params.accountId === g.linkedAccountId) {
              linkedBalance = Math.max(0, linkedBalance - params.amountCentavos);
            }
            const totalSavedCentavos = newContributions + linkedBalance;
            const remainingCentavos = Math.max(0, g.targetAmountCentavos - totalSavedCentavos);
            const percentage =
              g.targetAmountCentavos > 0
                ? Math.min(100, Math.round((totalSavedCentavos / g.targetAmountCentavos) * 100))
                : 100;

            return {
              ...g,
              contributionsTotalCentavos: newContributions,
              totalSavedCentavos,
              remainingCentavos,
              percentage
            };
          }
          return g;
        })
      );
    }
  };

  return {
    goals,
    sharedGoals,
    fetchGoals,
    handleAddGoal,
    handleContribute
  };
}
