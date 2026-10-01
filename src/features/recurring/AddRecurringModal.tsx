import React from 'react';
import { Account, Category, RecurringFrequency } from '../../types';
import { Modal } from '../../shared/components/ui/Modal';
import { RecurringForm, RecurringFormData } from './RecurringForm';

export interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onAddRecurring: (rule: {
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
  }) => Promise<void>;
}

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  onAddRecurring
}) => {
  const handleSubmit = async (data: RecurringFormData) => {
    await onAddRecurring(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Recurring Bill / Income">
      <RecurringForm
        accounts={accounts}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Create Recurring Bill"
      />
    </Modal>
  );
};
