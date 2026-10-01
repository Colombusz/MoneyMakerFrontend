import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Goal, Account } from '../types';
import { Button, EmptyState, Tabs } from '../shared/components/ui';
import { GoalCard } from '../features/goals/GoalCard';

type GoalTab = 'ongoing' | 'finished';

interface GoalsViewProps {
  goals: Goal[];
  accounts: Account[];
  currency: string;
  onOpenAddGoal: () => void;
  onOpenContribute: (goal: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  accounts,
  currency,
  onOpenAddGoal,
  onOpenContribute,
}) => {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const [activeTab, setActiveTab] = useState<GoalTab>('ongoing');

  const percentage = (goal: Goal) =>
    goal.percentage !== undefined
      ? goal.percentage
      : Math.min(100, Math.round(((goal.totalSavedCentavos || 0) / goal.targetAmountCentavos) * 100)) || 0;
  const isCompleted = (goal: Goal) => percentage(goal) >= 100;

  const filteredGoals = goals.filter((g) => (activeTab === 'finished') === isCompleted(g));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
            Savings Goals
          </h2>
          <p className="text-xs sm:text-sm text-light-textMuted dark:text-dark-textMuted">
            Track milestones, contribution pace, and linked accounts
          </p>
        </div>
        <Button onClick={onOpenAddGoal} variant="primary" className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'ongoing', label: 'Ongoing' },
          { id: 'finished', label: 'Finished' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-4"
      />

      {filteredGoals.length === 0 ? (
        <EmptyState
          title={activeTab === 'ongoing' ? 'No Ongoing Goals' : 'No Finished Goals'}
          description={
            activeTab === 'ongoing'
              ? 'Set up goals like an Emergency Fund, Travel, or New Gadget, and monitor completion pace.'
              : 'Complete a goal to see it here!'
          }
          actionLabel="Create Your First Goal"
          onAction={onOpenAddGoal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              linkedAccount={goal.linkedAccountId ? accountMap.get(goal.linkedAccountId) : null}
              currency={currency}
              onContribute={onOpenContribute}
            />
          ))}
        </div>
      )}
    </div>
  );
};
