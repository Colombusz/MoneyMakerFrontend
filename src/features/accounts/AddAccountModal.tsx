import React, { useState } from 'react';
import { AccountType } from '../../types';
import { Modal, TextInput, AmountInput, Select, Button } from '../../shared/components/ui';
import { validateRequired } from '../../shared/utils/validation';

export interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: {
    name: string;
    type: AccountType;
    startingBalanceCentavos: number;
  }) => Promise<void>;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('savings');
  const [balanceCentavos, setBalanceCentavos] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameErr = validateRequired(name, 'Account name');
    if (nameErr) {
      setError(nameErr);
      return;
    }

    if (name.trim().toLowerCase() === 'cash' || type === 'cash') {
      setError('A default Cash account already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddAccount({
        name: name.trim(),
        type,
        startingBalanceCentavos: balanceCentavos
      });
      setName('');
      setBalanceCentavos(0);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypeOptions: { value: AccountType; label: string }[] = [
    { value: 'savings', label: 'Savings (General spending & emergency fund)' },
    { value: 'payroll', label: 'Payroll (Salary deposits & regular income)' },
    { value: 'goals', label: 'Goals (Dedicated savings targets)' },
    { value: 'cash', label: 'Cash / Physical Wallet' },
    { value: 'other', label: 'Other Account' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <TextInput
          label="Account Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Payroll, Savings, Maribank"
          autoFocus
        />

        <Select
          label="Account Type"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
          options={accountTypeOptions}
        />

        <AmountInput
          label="Starting Balance"
          valueCentavos={balanceCentavos}
          onChangeCentavos={setBalanceCentavos}
          placeholder="0.00"
        />

        <div className="flex items-center justify-end gap-3 mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};
