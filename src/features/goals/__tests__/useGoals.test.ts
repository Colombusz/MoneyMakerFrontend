import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGoals } from '../useGoals';
import { Account } from '../../../types';

const mockAccounts: Account[] = [
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
    id: 'acc-maribank',
    userId: 'local',
    name: 'Maribank Goals',
    type: 'goals',
    startingBalanceCentavos: 1000000,
    currentBalanceCentavos: 1000000, // 10,000 PHP
    isArchived: false,
    updatedAt: ''
  }
];

describe('useGoals linked account progress calculation', () => {
  it('counts a linked account balance as progress even with no contributions', async () => {
    const onAdjustBalance = vi.fn();
    const onReloadData = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useGoals(false, false, onAdjustBalance, onReloadData, mockAccounts)
    );

    await act(async () => {
      await result.current.handleAddGoal({
        name: 'Emergency Fund',
        targetAmountCentavos: 2000000, // 20,000 PHP
        linkedAccountId: 'acc-maribank'
      });
    });

    expect(result.current.goals).toHaveLength(1);
    const goal = result.current.goals[0];
    expect(goal.totalSavedCentavos).toBe(1000000);
    expect(goal.remainingCentavos).toBe(1000000);
    expect(goal.percentage).toBe(50);
  });

  it('starts unlinked goals at 0 saved and 0 percentage', async () => {
    const onAdjustBalance = vi.fn();
    const onReloadData = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useGoals(false, false, onAdjustBalance, onReloadData, mockAccounts)
    );

    await act(async () => {
      await result.current.handleAddGoal({
        name: 'Vacation',
        targetAmountCentavos: 1000000
      });
    });

    const goal = result.current.goals[0];
    expect(goal.totalSavedCentavos).toBe(0);
    expect(goal.percentage).toBe(0);
    expect(goal.remainingCentavos).toBe(1000000);
  });

  it('adds contributions from another account on top of the connected account balance', async () => {
    const onAdjustBalance = vi.fn();
    const onReloadData = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useGoals(false, false, onAdjustBalance, onReloadData, mockAccounts)
    );

    await act(async () => {
      await result.current.handleAddGoal({
        name: 'Emergency Fund',
        targetAmountCentavos: 2000000,
        linkedAccountId: 'acc-maribank'
      });
    });

    const goalId = result.current.goals[0].id;

    // Contribute 1,000 PHP (100,000 centavos) from Payroll
    await act(async () => {
      await result.current.handleContribute({
        goalId,
        isShared: false,
        amountCentavos: 100000,
        accountId: 'acc-payroll',
        date: new Date().toISOString()
      });
    });

    const updated = result.current.goals[0];
    expect(updated.totalSavedCentavos).toBe(1100000); // 10,000 + 1,000 PHP
    expect(updated.percentage).toBe(55);
    expect(updated.remainingCentavos).toBe(900000);
    expect(onAdjustBalance).toHaveBeenCalledWith('acc-payroll', -100000);
  });

  it('does not change net progress when contributing from the linked account itself', async () => {
    const onAdjustBalance = vi.fn();
    const onReloadData = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useGoals(false, false, onAdjustBalance, onReloadData, mockAccounts)
    );

    await act(async () => {
      await result.current.handleAddGoal({
        name: 'Emergency Fund',
        targetAmountCentavos: 2000000,
        linkedAccountId: 'acc-maribank'
      });
    });

    const goalId = result.current.goals[0].id;

    // Contribute 2,000 PHP (200,000 centavos) from Maribank itself
    await act(async () => {
      await result.current.handleContribute({
        goalId,
        isShared: false,
        amountCentavos: 200000,
        accountId: 'acc-maribank',
        date: new Date().toISOString()
      });
    });

    const updated = result.current.goals[0];
    // Maribank balance debited 200k (800k remaining) + 200k contribution = 1,000,000 total
    expect(updated.totalSavedCentavos).toBe(1000000);
    expect(updated.percentage).toBe(50);
    expect(onAdjustBalance).toHaveBeenCalledWith('acc-maribank', -200000);
  });

  it('updates goal percentage reactively when linked account balance moves', async () => {
    const onAdjustBalance = vi.fn();
    const onReloadData = vi.fn().mockResolvedValue(undefined);

    let currentAccounts = [...mockAccounts];
    const { result, rerender } = renderHook(
      ({ accs }) => useGoals(false, false, onAdjustBalance, onReloadData, accs),
      { initialProps: { accs: currentAccounts } }
    );

    await act(async () => {
      await result.current.handleAddGoal({
        name: 'Emergency Fund',
        targetAmountCentavos: 2000000,
        linkedAccountId: 'acc-maribank'
      });
    });

    expect(result.current.goals[0].percentage).toBe(50);

    // Simulate an income deposit into Maribank of 500,000 centavos (5,000 PHP)
    currentAccounts = currentAccounts.map((a) =>
      a.id === 'acc-maribank'
        ? { ...a, currentBalanceCentavos: 1500000 }
        : a
    );

    rerender({ accs: currentAccounts });

    expect(result.current.goals[0].totalSavedCentavos).toBe(1500000);
    expect(result.current.goals[0].percentage).toBe(75);
    expect(result.current.goals[0].remainingCentavos).toBe(500000);
  });

  it('never lets an overdrawn linked account subtract from progress', async () => {
    const onAdjustBalance = vi.fn();
    const onReloadData = vi.fn().mockResolvedValue(undefined);

    const overdrawnAccounts: Account[] = [
      {
        id: 'acc-overdrawn',
        userId: 'local',
        name: 'Overdrawn Bank',
        type: 'savings',
        startingBalanceCentavos: 0,
        currentBalanceCentavos: -500000,
        isArchived: false,
        updatedAt: ''
      }
    ];

    const { result } = renderHook(() =>
      useGoals(false, false, onAdjustBalance, onReloadData, overdrawnAccounts)
    );

    await act(async () => {
      await result.current.handleAddGoal({
        name: 'Emergency Fund',
        targetAmountCentavos: 1000000,
        linkedAccountId: 'acc-overdrawn'
      });
    });

    expect(result.current.goals[0].totalSavedCentavos).toBe(0);
    expect(result.current.goals[0].percentage).toBe(0);
    expect(result.current.goals[0].remainingCentavos).toBe(1000000);
  });
});
