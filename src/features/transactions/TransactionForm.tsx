import React, { useState } from 'react';
import { Account, Category, TransactionType } from '../../types';
import { Button, AmountInput, TextInput, Select, DatePicker } from '../../shared/components/ui';
import { validateRequired, validatePositiveAmount } from '../../shared/utils/validation';

export interface TransactionFormData {
  type: TransactionType;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  amountCentavos: number;
  date: string;
  notes?: string;
  source?: string;
}

export interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  accounts,
  categories,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Transaction'
}) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amountCentavos, setAmountCentavos] = useState<number>(initialData?.amountCentavos || 0);
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState(
    initialData?.destinationAccountId || (accounts.length > 1 ? accounts[1].id : '')
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [source, setSource] = useState(initialData?.source || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = categories.filter(
    (c) => c.type === (type === 'income' ? 'income' : 'expense')
  );

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

    if (type === 'transfer') {
      if (!destinationAccountId) {
        setError('Please select a destination account');
        return;
      }
      if (accountId === destinationAccountId) {
        setError('Source and destination accounts must be different');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        accountId,
        destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
        categoryId: type !== 'transfer' ? categoryId || availableCategories[0]?.id : undefined,
        amountCentavos,
        date,
        notes: notes.trim() || undefined,
        source: type === 'income' ? source.trim() || undefined : undefined
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountOptions = accounts.map((acc) => ({ value: acc.id, label: acc.name }));
  const categoryOptions = availableCategories.map((cat) => ({ value: cat.id, label: cat.name }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Type Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-lg">
        {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`py-2 text-xs font-semibold rounded-md capitalize transition-colors min-h-[38px] ${
              type === t
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AmountInput
        valueCentavos={amountCentavos}
        onChangeCentavos={setAmountCentavos}
        placeholder="0.00"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label={type === 'transfer' ? 'From Account' : 'Account'}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accountOptions}
        />

        {type === 'transfer' ? (
          <Select
            label="To Account"
            value={destinationAccountId}
            onChange={(e) => setDestinationAccountId(e.target.value)}
            options={accountOptions}
          />
        ) : (
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
          />
        )}
      </div>

      <DatePicker value={date} onChange={(e) => setDate(e.target.value)} />

      {type === 'income' && (
        <TextInput
          label="Source / Payer"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g. Employer, Client, Refund"
        />
      )}

      <TextInput
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={type === 'transfer' ? 'Transfer notes...' : 'What was this for?'}
      />

      <div className="flex items-center justify-end gap-3 mt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} fullWidth={!onCancel}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
