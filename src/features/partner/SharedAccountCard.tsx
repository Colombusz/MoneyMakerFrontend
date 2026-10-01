import React, { useState } from 'react';
import { ArrowDownToLine, ReceiptText, Plus, X } from 'lucide-react';
import { Account } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { formatDisplayDate } from '../../shared/utils/date';
import { Button } from '../../shared/components/ui';
import { SharedAccount } from './useSharedAccounts';

interface Props {
  account: SharedAccount;
  ownAccounts: Account[];
  currency: string;
  onDeposit: (id: string, amount: number, fundingId: string, notes?: string) => Promise<void>;
  onExpense: (id: string, amount: number, notes?: string) => Promise<void>;
  onError: (msg: string) => void;
}

export const SharedAccountCard: React.FC<Props> = ({ account, ownAccounts, currency, onDeposit, onExpense, onError }) => {
  const [mode, setMode] = useState<'deposit' | 'expense' | null>(null);
  const [amount, setAmount] = useState('');
  const [fundingId, setFundingId] = useState(ownAccounts[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const deposits = account.recentMovements.filter((m) => m.type === 'deposit');
  const submit = async () => {
    const units = parseFloat(amount);
    if (!Number.isFinite(units) || units <= 0) { onError('Enter an amount greater than zero.'); return; }
    if (mode === 'deposit' && !fundingId) { onError('Pick which of your accounts funds this deposit.'); return; }
    setBusy(true);
    try {
      const centavos = Math.round(units * 100);
      if (mode === 'deposit') await onDeposit(account.id, centavos, fundingId, notes || undefined);
      else await onExpense(account.id, centavos, notes || undefined);
      setMode(null); setAmount(''); setNotes('');
    } catch (err: any) { onError(err?.message || 'Failed to save movement'); }
    finally { setBusy(false); }
  };
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div><h4 className="text-base font-bold text-slate-900 dark:text-white">{account.name}</h4>
        <span className="text-xs text-slate-400">Shared balance</span></div>
        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatCentavos(account.balanceCentavos, currency)}</span>
      </div>
      {account.members.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {account.members.map((m) => (
            <div key={m.userId || m.name} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block truncate">{m.name}</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{formatCentavos(m.totalDepositedCentavos, currency)}</span>
            </div>
          ))}
        </div>
      )}
      {deposits.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Recent movements</span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {deposits.slice(0, 5).map((m) => (
              <div key={m.id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300">{m.userName ?? 'Partner'}{m.notes ? ` (${m.notes})` : ''}</span>
                  <span className="font-semibold text-emerald-600">+{formatCentavos(m.amountCentavos, currency)}</span>
                </div>
                {m.fundingAccountName && (<div className="text-[11px] text-slate-400 mt-0.5">Funded from {m.fundingAccountName} (-{formatCentavos(m.amountCentavos, currency)})</div>)}
                <div className="text-[11px] text-slate-400">{formatDisplayDate(m.date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {mode === null ? (
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" onClick={() => setMode('deposit')} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"><ArrowDownToLine className="w-4 h-4" /><span>Deposit</span></Button>
          <Button size="sm" variant="outline" onClick={() => setMode('expense')} className="flex items-center justify-center gap-1.5"><ReceiptText className="w-4 h-4" /><span>Record expense</span></Button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{mode === 'deposit' ? 'Deposit into shared account' : 'Record shared expense'}</span>
            <button onClick={() => setMode(null)} aria-label="Cancel" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-4 h-4" /></button>
          </div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">Amount
            <input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
          </label>
          {mode === 'deposit' && (
            <label className="block text-xs text-slate-500 dark:text-slate-400">Funding account (your private account)
              <select value={fundingId} onChange={(e) => setFundingId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
                {ownAccounts.filter((a) => !a.isArchived).map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select>
            </label>
          )}
          <label className="block text-xs text-slate-500 dark:text-slate-400">Notes (optional)
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={mode === 'deposit' ? 'e.g. monthly share' : 'e.g. groceries'} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
          </label>
          <Button size="sm" disabled={busy} isLoading={busy} onClick={submit} className="w-full flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /><span>{mode === 'deposit' ? 'Confirm deposit' : 'Confirm expense'}</span></Button>
        </div>
      )}
    </div>
  );
};
