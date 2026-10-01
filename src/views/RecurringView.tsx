import React, { useState } from 'react';
import { Repeat, Plus } from 'lucide-react';
import { RecurringRule, WebProjectedOccurrence, Category, Account } from '../types';
import { Button, EmptyState, Card } from '../shared/components/ui';
import { ProjectedOccurrenceItem } from '../features/recurring/ProjectedOccurrenceItem';
import { RecurringRuleCard } from '../features/recurring/RecurringRuleCard';
import { PayOccurrenceModal } from '../features/recurring/PayOccurrenceModal';

interface RecurringViewProps {
  recurringRules: RecurringRule[];
  occurrences: WebProjectedOccurrence[];
  categories: Category[];
  accounts: Account[];
  currency: string;
  onOpenAddRecurring: () => void;
  onPayOccurrence: (ruleId: string, date: string, accountId?: string) => Promise<void>;
  onSkipOccurrence: (ruleId: string, date: string) => Promise<void>;
  onDeleteRule: (ruleId: string) => Promise<void>;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  recurringRules,
  occurrences,
  categories,
  accounts,
  currency,
  onOpenAddRecurring,
  onPayOccurrence,
  onSkipOccurrence,
  onDeleteRule
}) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  // Paying is a two-step flow: pick the occurrence, then choose the account the
  // payment is drawn from.
  const [paying, setPaying] = useState<WebProjectedOccurrence | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
            Recurring Bills & Income
          </h2>
          <p className="text-xs sm:text-sm text-light-textMuted dark:text-dark-textMuted">
            Automate projection for recurring expenses and manage single occurrences
          </p>
        </div>
        <Button
          onClick={onOpenAddRecurring}
          variant="primary"
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Bill</span>
        </Button>
      </div>

      {/* Upcoming Occurrences */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Repeat className="w-5 h-5 text-dark-primary" />
          <h3 className="text-base font-bold text-light-text dark:text-dark-text">
            Upcoming Projected Occurrences
          </h3>
        </div>

        {occurrences.length === 0 ? (
          <EmptyState
            title="No upcoming occurrences"
            description="No upcoming bill or income occurrences in this projection window."
          />
        ) : (
          <div className="space-y-2.5">
            {occurrences.map((item, idx) => (
              <ProjectedOccurrenceItem
                key={`${item.ruleId}-${item.date}-${idx}`}
                item={item}
                category={categoryMap.get(item.categoryId)}
                account={accountMap.get(item.accountId)}
                currency={currency}
                onPay={(ruleId, date) => {
                  const occ = occurrences.find((o) => o.ruleId === ruleId && o.date === date);
                  setPaying(occ ?? null);
                }}
                onSkip={onSkipOccurrence}
              />
            ))}
          </div>
        )}
      </div>

      {/* Configured Rules */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-bold text-light-text dark:text-dark-text">
            Active Recurring Rules
          </h3>
        </div>

        {recurringRules.length === 0 ? (
          <EmptyState
            title="No active rules"
            description="Set up recurring bills or subscriptions to automate your cashflow schedule."
            actionLabel="Add Recurring Rule"
            onAction={onOpenAddRecurring}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recurringRules.map((rule) => (
              <RecurringRuleCard
                key={rule.id}
                rule={rule}
                account={accountMap.get(rule.accountId)}
                category={categoryMap.get(rule.categoryId)}
                currency={currency}
                onDelete={onDeleteRule}
              />
            ))}
          </div>
        )}
      </div>

      <PayOccurrenceModal
        isOpen={paying !== null}
        occurrence={paying}
        accounts={accounts}
        currency={currency}
        onClose={() => setPaying(null)}
        onConfirm={async (accountId) => {
          if (!paying) return;
          await onPayOccurrence(paying.ruleId, paying.date, accountId);
        }}
      />
    </div>
  );
};
