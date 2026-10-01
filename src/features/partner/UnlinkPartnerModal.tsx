import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../shared/components/ui';

interface UnlinkPartnerModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const UnlinkPartnerModal: React.FC<UnlinkPartnerModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unlink Partner?">
      <div className="space-y-4">
        <div className="flex items-start gap-3 text-amber-500">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            When unlinking, existing shared goals will be <strong>archived and frozen</strong>.{' '}
            Historical contributions will remain safely recorded in your transaction history, but no
            new contributions can be made to shared goals.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Unlinking...' : 'Confirm Unlink'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
