import React, { useState } from 'react';
import { Account } from '../../types';
import {
  Modal,
  AmountInput,
  Select,
  DatePicker,
  TextInput,
  Button
} from '../../shared/components/ui';
import { validateRequired, validatePositiveAmount } from '../../shared/utils/validation';

export interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalName: string;
  goalId: string;
  isShared: boolean;
  accounts: Account[];
  onContribute: (params: {
    goalId: string;
    isShared: boolean;
    amountCentavos: number;
    accountId: string;
    date: string;
    notes?: string;
  }) => Promise<void>;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  goalName,
  goalId,
  isShared,
  accounts,
  onContribute
}) => {
  const [amountCentavos, setAmountCentavos] = useState<number>(0);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountErr = validatePositiveAmount(amountCentavos);
    if (amountErr) {
      setError(amountErr);
      return;
    }

    const accountErr = validateRequired(accountId, 'Account');
    if (accountErr) {
      setError(accountErr);
      return;
    }

    setIsSubmitting(true);
    try {
      await onContribute({
        goalId,
        isShared,
        amountCentavos,
        accountId,
        date,
        notes: notes.trim() || undefined
      });
      setAmountCentavos(0);
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountOptions = accounts.map((acc) => ({ value: acc.id, label: acc.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Funds: ${goalName}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <AmountInput
          label="Deposit Amount"
          valueCentavos={amountCentavos}
          onChangeCentavos={setAmountCentavos}
          placeholder="0.00"
        />

        <Select
          label="Debit from Account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accountOptions}
        />

        <DatePicker
          label="Contribution Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <TextInput
          label="Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Salary savings bonus"
        />

        <div className="flex items-center justify-end gap-3 mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Confirm Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
