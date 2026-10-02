import React, { useState, useEffect } from 'react';
import { Modal } from '../../shared/components/ui/Modal';
import { Button } from '../../shared/components/ui/Button';
import { TextInput } from '../../shared/components/ui/TextInput';
import { AmountInput } from '../../shared/components/ui/AmountInput';
import { Select } from '../../shared/components/ui/Select';
import { Account, Vacation, VacationChipIn, VacationTransactionLog, PastVacationSummary } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, User, Tag, Calendar, ArrowRight } from 'lucide-react';

// =========================================================================
// 1. Create Vacation Modal
// =========================================================================
export interface CreateVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
}

export const CreateVacationModal: React.FC<CreateVacationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for the vacation');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create vacation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a New Vacation">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <TextInput
          label="Vacation Name"
          placeholder="e.g. Boracay Summer Trip 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextInput
          label="Description / Destination (Optional)"
          placeholder="e.g. Beach resort, island hopping & seafood feast"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
          <p className="font-semibold flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>You will be the Vacation Master</span>
          </p>
          <p className="text-[11px] opacity-90">
            A dedicated vacation account and a unique 6-character join code will be generated. You will control shared expenses, chip-in items, refunds, and final conclusion.
          </p>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Create Vacation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 2. Join Vacation Modal
// =========================================================================
export interface JoinVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (joinCode: string) => Promise<void>;
}

export const JoinVacationModal: React.FC<JoinVacationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the 6-character vacation code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(code.trim().toUpperCase());
      setCode('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to join vacation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a Vacation">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Vacation Join Code
          </label>
          <input
            type="text"
            maxLength={10}
            placeholder="e.g. V269EC"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 text-lg font-mono font-bold tracking-widest uppercase text-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
            Ask your Vacation Master for their unique vacation code.
          </p>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Join Vacation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 3. Deposit Vacation Modal
// =========================================================================
export interface DepositVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  currency: string;
  onSubmit: (amountCentavos: number, fromAccountId: string, notes?: string) => Promise<void>;
}

export const DepositVacationModal: React.FC<DepositVacationModalProps> = ({
  isOpen,
  onClose,
  accounts,
  currency,
  onSubmit
}) => {
  const [amountCentavos, setAmountCentavos] = useState(0);
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountCentavos <= 0) {
      setError('Please enter a deposit amount greater than zero');
      return;
    }
    if (!selectedAccount) {
      setError('Please select a local funding account');
      return;
    }
    if (selectedAccount.currentBalanceCentavos < amountCentavos) {
      setError(
        `Insufficient funds in ${selectedAccount.name}. Available: ${formatCentavos(
          selectedAccount.currentBalanceCentavos,
          currency
        )}`
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(amountCentavos, selectedAccount.id, notes.trim() || undefined);
      setAmountCentavos(0);
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deposit to Vacation Pool">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AmountInput
          label="Deposit Amount"
          valueCentavos={amountCentavos}
          onChangeCentavos={(c) => {
            setAmountCentavos(c);
            setError(null);
          }}
        />

        <Select
          label="From Local Account"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          options={accounts.map((a) => ({
            value: a.id,
            label: `${a.name} (${formatCentavos(a.currentBalanceCentavos, currency)})`
          }))}
        />

        <TextInput
          label="Notes (Optional)"
          placeholder="e.g. Initial pool share"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-semibold mb-0.5">Transparent & Immutable</p>
          <p className="text-[11px] opacity-80">
            This deposit will deduct {formatCentavos(amountCentavos, currency)} from your {selectedAccount?.name || 'account'} and add it to the shared pool. It will be logged in the public vacation ledger.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Deposit Funds
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 4. Create Shared Expense Item Modal (Master Only)
// =========================================================================
export interface CreateExpenseItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacationBalanceCentavos: number;
  chipIns?: VacationChipIn[];
  currency: string;
  onSubmit: (
    title: string,
    amountCentavos: number,
    category?: string,
    notes?: string,
    deductionSource?: 'pool' | 'chip_in',
    chipInId?: string
  ) => Promise<void>;
}

export const CreateExpenseItemModal: React.FC<CreateExpenseItemModalProps> = ({
  isOpen,
  onClose,
  vacationBalanceCentavos,
  chipIns = [],
  currency,
  onSubmit
}) => {
  const [deductionSource, setDeductionSource] = useState<'pool' | 'chip_in'>('pool');
  const [selectedChipInId, setSelectedChipInId] = useState('');
  const [title, setTitle] = useState('');
  const [amountCentavos, setAmountCentavos] = useState(0);
  const [category, setCategory] = useState('Accommodation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chipIns && chipIns.length > 0 && !selectedChipInId) {
      setSelectedChipInId(chipIns[0]._id);
    }
  }, [chipIns, selectedChipInId]);

  const isChipIn = deductionSource === 'chip_in';
  const selectedChipIn = chipIns.find((c) => c._id === selectedChipInId);
  const chipInAvailableCentavos = selectedChipIn
    ? Math.max(0, selectedChipIn.totalCollectedCentavos - (selectedChipIn.totalSpentCentavos || 0))
    : 0;
  const currentAvailableBalance = isChipIn ? chipInAvailableCentavos : vacationBalanceCentavos;
  const isOverdraft = amountCentavos > currentAvailableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter an expense title');
      return;
    }
    if (amountCentavos <= 0) {
      setError('Please enter an expense amount greater than zero');
      return;
    }
    if (isChipIn && (!selectedChipInId || !selectedChipIn)) {
      setError('Please select a valid chip-in item');
      return;
    }
    if (isOverdraft) {
      setError(
        isChipIn
          ? `Expense amount exceeds available balance for ${selectedChipIn?.title} (${formatCentavos(
              chipInAvailableCentavos,
              currency
            )}).`
          : `Expense amount exceeds current vacation balance (${formatCentavos(
              vacationBalanceCentavos,
              currency
            )}). Please create a chip-in to pool more funds first.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(
        title.trim(),
        amountCentavos,
        category,
        notes.trim() || undefined,
        deductionSource,
        isChipIn ? selectedChipInId : undefined
      );
      setTitle('');
      setAmountCentavos(0);
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create expense item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Shared Vacation Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Source of Deduction Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
            Source of Deduction
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setDeductionSource('pool');
                setError(null);
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                deductionSource === 'pool'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm ring-1 ring-amber-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span>Main Pool</span>
              <span className="font-mono text-[11px] font-normal opacity-80">
                {formatCentavos(vacationBalanceCentavos, currency)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDeductionSource('chip_in');
                setError(null);
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                deductionSource === 'chip_in'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-sm ring-1 ring-purple-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span>Chip-in Item</span>
              <span className="font-mono text-[11px] font-normal opacity-80">
                {chipIns && chipIns.length > 0 ? `${chipIns.length} item(s)` : 'None'}
              </span>
            </button>
          </div>
        </div>

        {/* Chip-In Item Selector if Chip-In is selected */}
        {isChipIn && (
          <div>
            {chipIns.length === 0 ? (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-800 dark:text-purple-300">
                No chip-in items available. Please create a chip-in item first or deduct from the Main Pool.
              </div>
            ) : (
              <Select
                label="Select Chip-in Item"
                value={selectedChipInId}
                onChange={(e) => {
                  setSelectedChipInId(e.target.value);
                  setError(null);
                }}
                options={chipIns.map((ci) => {
                  const avail = Math.max(0, ci.totalCollectedCentavos - (ci.totalSpentCentavos || 0));
                  return {
                    value: ci._id,
                    label: `${ci.title} (${formatCentavos(avail, currency)} available)`
                  };
                })}
              />
            )}
          </div>
        )}

        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            isChipIn
              ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
          }`}
        >
          <span className="font-semibold">
            {isChipIn ? 'Available Chip-in Balance:' : 'Current Main Pool Balance:'}
          </span>
          <span className="text-sm font-bold font-mono">
            {formatCentavos(currentAvailableBalance, currency)}
          </span>
        </div>

        <TextInput
          label="Expense Title"
          placeholder="e.g. Resort Booking / Boat Rental"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <AmountInput
          label="Expense Amount"
          valueCentavos={amountCentavos}
          onChangeCentavos={(c) => {
            setAmountCentavos(c);
            setError(null);
          }}
        />

        {isOverdraft && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              {isChipIn
                ? 'No Overdraft: Amount exceeds available chip-in balance.'
                : 'No Overdraft: Amount exceeds available pool balance.'}
            </span>
          </p>
        )}

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: 'Accommodation', label: 'Accommodation' },
            { value: 'Food & Dining', label: 'Food & Dining' },
            { value: 'Activities & Tours', label: 'Activities & Tours' },
            { value: 'Transportation', label: 'Transportation' },
            { value: 'Shopping & Supplies', label: 'Shopping & Supplies' },
            { value: 'Miscellaneous', label: 'Miscellaneous' }
          ]}
        />

        <TextInput
          label="Notes (Optional)"
          placeholder="e.g. Paid via master credit card"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading} disabled={isOverdraft || (isChipIn && !selectedChipIn)}>
            Deduct & Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 5. Log Personal Expense Modal (Any Member)
// =========================================================================
// 5. Log Personal Expense Modal (Any Member)
// =========================================================================
export interface LogPersonalExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  currency: string;
  onSubmit: (
    title: string,
    amountCentavos: number,
    fromAccountId: string,
    category?: string,
    notes?: string
  ) => Promise<void>;
}

export const LogPersonalExpenseModal: React.FC<LogPersonalExpenseModalProps> = ({
  isOpen,
  onClose,
  accounts,
  currency,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [amountCentavos, setAmountCentavos] = useState(0);
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [category, setCategory] = useState('Personal Shopping');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0].id);
    }
  }, [accounts, fromAccountId]);

  const selectedAccount = accounts.find((a) => a.id === fromAccountId);
  const isOverdraft = Boolean(selectedAccount && amountCentavos > selectedAccount.currentBalanceCentavos);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter an expense title');
      return;
    }
    if (amountCentavos <= 0) {
      setError('Please enter an amount greater than zero');
      return;
    }
    if (!selectedAccount) {
      setError('Please select an account to deduct this expense from');
      return;
    }
    if (isOverdraft) {
      setError(
        `Insufficient funds in ${selectedAccount.name}. Available: ${formatCentavos(
          selectedAccount.currentBalanceCentavos,
          currency
        )}`
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(title.trim(), amountCentavos, selectedAccount.id, category, notes.trim() || undefined);
      setTitle('');
      setAmountCentavos(0);
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to log personal expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Personal Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-sky-50 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800/60 text-xs text-sky-800 dark:text-sky-300">
          <p className="font-semibold mb-0.5">Personal Expense Deduction</p>
          <p className="text-[11px] opacity-90">
            Deducted from your personal account for personal tracking. <strong>Does not change the shared vacation pool balance.</strong>
          </p>
        </div>

        <TextInput
          label="Item / Activity Name"
          placeholder="e.g. Souvenir t-shirt / Beach bar drinks"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <AmountInput
          label="Amount Spent"
          valueCentavos={amountCentavos}
          onChangeCentavos={(c) => {
            setAmountCentavos(c);
            setError(null);
          }}
        />

        <Select
          label="Deduct From Account"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          options={accounts.map((a) => ({
            value: a.id,
            label: `${a.name} (${formatCentavos(a.currentBalanceCentavos, currency)})`
          }))}
          required
        />

        {isOverdraft && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>No Overdraft: Amount exceeds available account balance.</span>
          </p>
        )}

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: 'Personal Shopping', label: 'Personal Shopping' },
            { value: 'Snacks & Drinks', label: 'Snacks & Drinks' },
            { value: 'Personal Transportation', label: 'Personal Transportation' },
            { value: 'Tips & Gratuity', label: 'Tips & Gratuity' },
            { value: 'Miscellaneous', label: 'Miscellaneous' }
          ]}
        />

        <TextInput
          label="Notes (Optional)"
          placeholder="e.g. Bought at the market"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Deduct & Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 6. Create Chip-in Item Modal (Master Only)
// =========================================================================
export interface CreateChipInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, targetAmountCentavos?: number, description?: string) => Promise<void>;
}

export const CreateChipInModal: React.FC<CreateChipInModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [targetAmountCentavos, setTargetAmountCentavos] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title for the chip-in');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(
        title.trim(),
        targetAmountCentavos > 0 ? targetAmountCentavos : undefined,
        description.trim() || undefined
      );
      setTitle('');
      setTargetAmountCentavos(0);
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create chip-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request a Chip-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <TextInput
          label="Chip-in Title"
          placeholder="e.g. Seafood Dinner Feast / Island Tour"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <AmountInput
          label="Target Amount (Optional)"
          placeholder="Leave 0 for open-ended"
          valueCentavos={targetAmountCentavos}
          onChangeCentavos={setTargetAmountCentavos}
        />

        <TextInput
          label="Description / Purpose (Optional)"
          placeholder="e.g. Everyone pitching in for tonight's buffet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs text-purple-800 dark:text-purple-300">
          <p className="font-semibold mb-0.5">Chip-in Pooling</p>
          <p className="text-[11px] opacity-90">
            Members can contribute directly from their local accounts. All contributions will be added to the shared vacation account balance.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Create Chip-in
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 7. Contribute to Chip-in Modal (Any Member)
// =========================================================================
export interface ContributeChipInModalProps {
  isOpen: boolean;
  onClose: () => void;
  chipIn: VacationChipIn | null;
  accounts: Account[];
  currency: string;
  onSubmit: (chipInId: string, amountCentavos: number, fromAccountId: string, notes?: string) => Promise<void>;
}

export const ContributeChipInModal: React.FC<ContributeChipInModalProps> = ({
  isOpen,
  onClose,
  chipIn,
  accounts,
  currency,
  onSubmit
}) => {
  const [amountCentavos, setAmountCentavos] = useState(0);
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chipIn) return;
    if (amountCentavos <= 0) {
      setError('Please enter a contribution amount greater than zero');
      return;
    }
    if (!selectedAccount) {
      setError('Please select a local funding account');
      return;
    }
    if (selectedAccount.currentBalanceCentavos < amountCentavos) {
      setError(
        `Insufficient funds in ${selectedAccount.name}. Available: ${formatCentavos(
          selectedAccount.currentBalanceCentavos,
          currency
        )}`
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(chipIn._id, amountCentavos, selectedAccount.id, notes.trim() || undefined);
      setAmountCentavos(0);
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to contribute to chip-in');
    } finally {
      setLoading(false);
    }
  };

  if (!chipIn) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chip in for: ${chipIn.title}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">Total Collected so far:</span>
          <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
            {formatCentavos(chipIn.totalCollectedCentavos, currency)}
            {chipIn.targetAmountCentavos ? ` of ${formatCentavos(chipIn.targetAmountCentavos, currency)}` : ''}
          </span>
        </div>

        <AmountInput
          label="Your Contribution"
          valueCentavos={amountCentavos}
          onChangeCentavos={(c) => {
            setAmountCentavos(c);
            setError(null);
          }}
        />

        <Select
          label="Fund From Local Account"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          options={accounts.map((a) => ({
            value: a.id,
            label: `${a.name} (${formatCentavos(a.currentBalanceCentavos, currency)})`
          }))}
        />

        <TextInput
          label="Notes (Optional)"
          placeholder="e.g. My share for dinner"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Contribute Funds
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 8. Refund Modal (Master Only)
// =========================================================================
export interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacation: Vacation;
  chipIns?: VacationChipIn[];
  currency: string;
  onSubmit: (
    memberUserId: string,
    amountCentavos: number,
    notes?: string,
    refundSource?: 'pool' | 'chip_in',
    chipInId?: string | null
  ) => Promise<void>;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  onClose,
  vacation,
  chipIns = [],
  currency,
  onSubmit
}) => {
  const [memberUserId, setMemberUserId] = useState(vacation.members[0]?.userId || '');
  const [refundSource, setRefundSource] = useState<'pool' | 'chip_in'>('pool');
  const [selectedChipInId, setSelectedChipInId] = useState('');
  const [amountCentavos, setAmountCentavos] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChipInAvailable = (c: VacationChipIn) =>
    c.totalCollectedCentavos - (c.totalSpentCentavos || 0) - (c.totalRefundedCentavos || 0);

  const availableChipIns = chipIns.filter((c) => getChipInAvailable(c) > 0);

  useEffect(() => {
    if (vacation.members.length > 0 && !memberUserId) {
      setMemberUserId(vacation.members[0].userId);
    }
  }, [vacation.members, memberUserId]);

  useEffect(() => {
    if (refundSource === 'chip_in' && !selectedChipInId && availableChipIns.length > 0) {
      setSelectedChipInId(availableChipIns[0]._id);
    }
  }, [refundSource, selectedChipInId, availableChipIns]);

  const selectedChipIn = chipIns.find((c) => c._id === selectedChipInId);
  const maxRefund =
    refundSource === 'chip_in'
      ? selectedChipIn
        ? getChipInAvailable(selectedChipIn)
        : 0
      : vacation.balanceCentavos;

  const isOverRemaining = amountCentavos > maxRefund;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberUserId) {
      setError('Please select a member to refund');
      return;
    }
    if (refundSource === 'chip_in' && !selectedChipIn) {
      setError('Please select a chip-in item with remaining funds');
      return;
    }
    if (amountCentavos <= 0) {
      setError('Please enter a refund amount greater than zero');
      return;
    }
    if (isOverRemaining) {
      setError(
        `Refund cannot exceed remaining balance of ${formatCentavos(maxRefund, currency)}`
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(
        memberUserId,
        amountCentavos,
        notes.trim() || undefined,
        refundSource,
        refundSource === 'chip_in' ? selectedChipInId : null
      );
      setAmountCentavos(0);
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Refund failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Leftover Funds Back (Refund)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Source of Refund Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Source of Refund
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setRefundSource('pool');
                setError(null);
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                refundSource === 'pool'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <span>Main Vacation Pool</span>
              <span className="font-mono text-[11px] font-bold">
                {formatCentavos(vacation.balanceCentavos, currency)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRefundSource('chip_in');
                setError(null);
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                refundSource === 'chip_in'
                  ? 'border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <span>Chip-in Item</span>
              <span className="font-mono text-[11px] font-bold">
                {availableChipIns.length} available
              </span>
            </button>
          </div>
        </div>

        {refundSource === 'chip_in' && (
          <div>
            {availableChipIns.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
                No chip-in items currently have leftover remaining funds.
              </p>
            ) : (
              <Select
                label="Select Chip-in Item"
                value={selectedChipInId}
                onChange={(e) => setSelectedChipInId(e.target.value)}
                options={availableChipIns.map((c) => ({
                  value: c._id,
                  label: `${c.title} (Available: ${formatCentavos(getChipInAvailable(c), currency)})`
                }))}
              />
            )}
          </div>
        )}

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <span className="font-semibold">
            {refundSource === 'chip_in' ? 'Available Chip-in Remaining:' : 'Remaining Vacation Balance:'}
          </span>
          <span className="text-sm font-bold font-mono">
            {formatCentavos(maxRefund, currency)}
          </span>
        </div>

        <Select
          label="Select Member to Refund"
          value={memberUserId}
          onChange={(e) => setMemberUserId(e.target.value)}
          options={vacation.members.map((m) => ({
            value: m.userId,
            label: `${m.name} (${m.role})`
          }))}
        />

        <AmountInput
          label="Refund Amount"
          valueCentavos={amountCentavos}
          onChangeCentavos={(c) => {
            setAmountCentavos(c);
            setError(null);
          }}
        />

        {isOverRemaining && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Amount exceeds remaining {refundSource === 'chip_in' ? 'chip-in' : 'vacation pool'} balance.</span>
          </p>
        )}

        <TextInput
          label="Notes (Optional)"
          placeholder="e.g. End of trip equal share refund"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Leftover funds will be transferred directly to the member's account as an income transaction.
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={loading}
            disabled={isOverRemaining || (refundSource === 'chip_in' && !selectedChipIn)}
          >
            Transfer Refund
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 9. Reverse Log Modal (Master Only)
// =========================================================================
export interface ReverseLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: VacationTransactionLog | null;
  currency: string;
  onSubmit: (logId: string, reason: string) => Promise<void>;
}

export const ReverseLogModal: React.FC<ReverseLogModalProps> = ({
  isOpen,
  onClose,
  log,
  currency,
  onSubmit
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!log) return;
    if (!reason.trim()) {
      setError('Please provide a reason for the reversal');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(log._id, reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to reverse transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Append Reversing Entry">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Reversing: {log.description}
          </p>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Type: {log.type}</span>
            <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
              {formatCentavos(log.amountCentavos, currency)}
            </span>
          </div>
        </div>

        <TextInput
          label="Reason for Correction"
          placeholder="e.g. Duplicate entry recorded by mistake"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
          <p className="font-semibold mb-0.5">Append-Only Audit Trail</p>
          <p className="text-[11px] opacity-90">
            Original entries are never erased or deleted. This action safely appends an offsetting reversal record into the transaction log and adjusts the vacation pool balance.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" isLoading={loading}>
            Apply Reversal
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 10. Past Vacation Summary Modal (Viewing Member Isolation)
// =========================================================================
export interface PastVacationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: PastVacationSummary | null;
  currency: string;
}

export const PastVacationSummaryModal: React.FC<PastVacationSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<'shared' | 'expenses' | 'chipIns'>('shared');

  if (!summary) return null;

  const { vacation, sharedExpenses = [], myLoggedExpenses, myChipIns, summary: stats } = summary;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vacation.name} maxWidth="lg">
      <div className="space-y-5">
        {/* Header Badge & Description */}
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Concluded & Read-Only</span>
            </span>
            {vacation.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {vacation.description}
              </p>
            )}
          </div>
          <span className="font-mono text-xs text-gray-400">Code: {vacation.joinCode}</span>
        </div>

        {/* Personal & Group Spending Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block">
              Your Net Total
            </span>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {formatCentavos(stats.myTotalSpentCentavos, currency)}
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
            <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium block">
              Group Shared Total
            </span>
            <span className="text-base font-bold text-amber-700 dark:text-amber-400 font-mono">
              {formatCentavos(stats.totalSharedExpensesCentavos, currency)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">
              Pool Deposits
            </span>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100 font-mono">
              {formatCentavos(stats.myDepositsCentavos, currency)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">
              Chip-ins
            </span>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100 font-mono">
              {formatCentavos(stats.myChipInContributionsCentavos, currency)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">
              Refunds Received
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCentavos(stats.myRefundsCentavos, currency)}
            </span>
          </div>
        </div>

        {/* Privacy Isolation Notice */}
        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <span>
            <strong>Transparent Shared Group Records & Strict Personal Privacy:</strong> Group shared expenses are visible to all members. Other members' personal logged expenses and chip-in contribution amounts remain strictly private.
          </span>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab('shared')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'shared'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Shared Expenses ({sharedExpenses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'expenses'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Your Logged Expenses ({myLoggedExpenses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chipIns')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'chipIns'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Your Chip-ins ({myChipIns.length})
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'shared' ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sharedExpenses.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No group shared expenses recorded for this vacation.</p>
            ) : (
              sharedExpenses.map((exp) => (
                <div
                  key={exp._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{exp.title}</p>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          exp.deductionSource === 'chip_in'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {exp.deductionSource === 'chip_in' ? 'Chip-in' : 'Main Pool'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {exp.category || 'Shared'} &bull; by {exp.createdByName} &bull; {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
                    {formatCentavos(exp.amountCentavos, currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'expenses' ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {myLoggedExpenses.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No personal expenses logged for this vacation.</p>
            ) : (
              myLoggedExpenses.map((exp) => (
                <div
                  key={exp._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{exp.title}</p>
                    <p className="text-[11px] text-gray-400">
                      {exp.category || 'General'} &bull; {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
                    {formatCentavos(exp.amountCentavos, currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {myChipIns.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No chip-in contributions recorded for you.</p>
            ) : (
              myChipIns.map((ci) => (
                <div
                  key={ci._id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{ci.title}</p>
                    <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                      Chip-in
                    </span>
                  </div>
                  {ci.contributions.map((c) => (
                    <div key={c._id} className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300 pl-2 border-l-2 border-purple-400">
                      <span>{c.notes || 'Contribution'} &bull; {new Date(c.date).toLocaleDateString()}</span>
                      <span className="font-mono font-bold">{formatCentavos(c.amountCentavos, currency)}</span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
