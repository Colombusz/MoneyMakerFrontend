import React from 'react';
import { Account, Category } from '../../types';
import { Modal } from '../../shared/components/ui/Modal';
import { TransactionForm, TransactionFormData } from './TransactionForm';

export interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onAddTransaction: (tx: TransactionFormData) => Promise<void>;
  /**
   * Pre-fills the form — the calendar passes the tapped day and the chosen type so
   * the entry is filed under the day the user clicked.
   */
  initialData?: Partial<TransactionFormData>;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  onAddTransaction,
  initialData
}) => {
  const handleSubmit = async (data: TransactionFormData) => {
    await onAddTransaction(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      {/* Keyed on the preset so each open starts from a clean form. */}
      <TransactionForm
        key={`${initialData?.type ?? 'expense'}-${initialData?.date ?? ''}`}
        accounts={accounts}
        categories={categories}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Record Transaction"
      />
    </Modal>
  );
};
