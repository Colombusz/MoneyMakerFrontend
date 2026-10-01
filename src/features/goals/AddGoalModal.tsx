import React, { useState } from 'react';
import { Account } from '../../types';
import {
  Modal,
  TextInput,
  AmountInput,
  DatePicker,
  Select,
  Button
} from '../../shared/components/ui';
import { validateRequired, validatePositiveAmount } from '../../shared/utils/validation';

export interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  isPartnerConnected: boolean;
  onAddGoal: (goal: {
    name: string;
    targetAmountCentavos: number;
    targetDate?: string;
    linkedAccountId?: string;
    isShared?: boolean;
  }) => Promise<void>;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  accounts,
  isPartnerConnected,
  onAddGoal
}) => {
  const [name, setName] = useState('');
  const [targetAmountCentavos, setTargetAmountCentavos] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState(
    accounts.find((a) => a.type === 'goals')?.id || accounts[0]?.id || ''
  );
  const [isShared, setIsShared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameErr = validateRequired(name, 'Goal name');
    if (nameErr) {
      setError(nameErr);
      return;
    }

    const amountErr = validatePositiveAmount(targetAmountCentavos, 'Target amount');
    if (amountErr) {
      setError(amountErr);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddGoal({
        name: name.trim(),
        targetAmountCentavos,
        targetDate: targetDate || undefined,
        linkedAccountId: linkedAccountId || undefined,
        isShared: isPartnerConnected ? isShared : false
      });
      setName('');
      setTargetAmountCentavos(0);
      setTargetDate('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountOptions = [
    { value: '', label: 'None (Unlinked)' },
    ...accounts.map((acc) => ({ value: acc.id, label: acc.name }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Savings Goal">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <TextInput
          label="Goal Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Emergency Fund, Japan Trip"
          autoFocus
        />

        <AmountInput
          label="Target Amount"
          valueCentavos={targetAmountCentavos}
          onChangeCentavos={setTargetAmountCentavos}
          placeholder="0.00"
        />

        <DatePicker
          label="Target Date (Optional)"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        <Select
          label="Linked Account (Optional)"
          value={linkedAccountId}
          onChange={(e) => setLinkedAccountId(e.target.value)}
          options={accountOptions}
        />

        {isPartnerConnected && (
          <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              Share this goal with your partner
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-6">
              Both of you can contribute. Your personal bank accounts remain strictly private.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
