import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { Account, WebProjectedOccurrence } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { formatDisplayDate } from '../../shared/utils/date';
import { Button, Modal, Select } from '../../shared/components/ui';

export interface PayOccurrenceModalProps {
  isOpen: boolean;
  occurrence: WebProjectedOccurrence | null;
  accounts: Account[];
  currency: string;
  onClose: () => void;
  onConfirm: (accountId: string) => Promise<void>;
}

/**
 * Asks which account a recurring payment is drawn from before recording it.
 * The rule's own account is preselected, so the common case stays one tap.
 */
export const PayOccurrenceModal: React.FC<PayOccurrenceModalProps> = ({
  isOpen,
  occurrence,
  accounts,
  currency,
  onClose,
  onConfirm
}) => {
  const [accountId, setAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preselect the rule's account each time the modal opens.
  useEffect(() => {
    if (isOpen && occurrence) {
      setAccountId(occurrence.accountId);
      setError(null);
    }
  }, [isOpen, occurrence]);

  const handleConfirm = async () => {
    if (!accountId) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(accountId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pay Recurring Bill">
      {occurrence && (
        <div className="flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {occurrence.notes || 'Recurring Bill'}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {formatCentavos(occurrence.amountCentavos, currency)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Due {formatDisplayDate(occurrence.date)}
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <Select
            label="Pay From"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          />

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!accountId || submitting}
              isLoading={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {!submitting && <Wallet className="w-4 h-4" />}
              <span>Confirm Payment</span>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};