import React, { useState } from 'react';
import { Account, Category, RecurringFrequency } from '../../types';
import { Button, AmountInput, TextInput, Select, DatePicker } from '../../shared/components/ui';
import { validateRequired, validatePositiveAmount } from '../../shared/utils/validation';

export interface RecurringFormData {
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
}

export interface RecurringFormProps {
  accounts: Account[];
  categories: Category[];
  initialData?: Partial<RecurringFormData>;
  onSubmit: (data: RecurringFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export const RecurringForm: React.FC<RecurringFormProps> = ({
  accounts,
  categories,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Recurring Rule'
}) => {
  const [type, setType] = useState<'expense' | 'income'>(initialData?.type || 'expense');
  const [amountCentavos, setAmountCentavos] = useState<number>(initialData?.amountCentavos || 0);
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(
    initialData?.frequency || 'monthly'
  );
  const [intervalDays, setIntervalDays] = useState(initialData?.intervalDays?.toString() || '14');
  const [startDate, setStartDate] = useState(
    initialData?.startDate || new Date().toISOString().split('T')[0]
  );
  const [hasEnd, setHasEnd] = useState<'none' | 'date' | 'count'>('none');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [maxOccurrences, setMaxOccurrences] = useState(
    initialData?.maxOccurrences?.toString() || '12'
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = categories.filter((c) => c.type === type);

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
      await onSubmit({
        accountId,
        categoryId: categoryId || availableCategories[0]?.id || '',
        type,
        amountCentavos,
        frequency,
        intervalDays: frequency === 'custom' ? parseInt(intervalDays, 10) || 1 : undefined,
        startDate,
        endDate: hasEnd === 'date' ? endDate : undefined,
        maxOccurrences: hasEnd === 'count' ? parseInt(maxOccurrences, 10) || undefined : undefined,
        notes: notes.trim() || undefined
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save recurring rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountOptions = accounts.map((acc) => ({ value: acc.id, label: acc.name }));
  const categoryOptions = availableCategories.map((cat) => ({ value: cat.id, label: cat.name }));
  const frequencyOptions: { value: RecurringFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom (Every X Days)' }
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Type Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-lg">
        {(['expense', 'income'] as const).map((t) => (
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
          label="Account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accountOptions}
        />
        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
          options={frequencyOptions}
        />
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {frequency === 'custom' && (
        <TextInput
          label="Repeat Interval (Days)"
          type="number"
          min="1"
          value={intervalDays}
          onChange={(e) => setIntervalDays(e.target.value)}
        />
      )}

      {/* End Criteria */}
      <div className="flex flex-col gap-2 pt-1">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Ends</label>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-700 dark:text-gray-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="hasEnd"
              checked={hasEnd === 'none'}
              onChange={() => setHasEnd('none')}
            />
            Never
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="hasEnd"
              checked={hasEnd === 'date'}
              onChange={() => setHasEnd('date')}
            />
            On Date
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="hasEnd"
              checked={hasEnd === 'count'}
              onChange={() => setHasEnd('count')}
            />
            After Occurrences
          </label>
        </div>

        {hasEnd === 'date' && (
          <DatePicker value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        )}

        {hasEnd === 'count' && (
          <TextInput
            label="Total Occurrences"
            type="number"
            min="1"
            value={maxOccurrences}
            onChange={(e) => setMaxOccurrences(e.target.value)}
          />
        )}
      </div>

      <TextInput
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Bill details..."
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
