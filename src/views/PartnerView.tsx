import React, { useMemo, useState } from 'react';
import { Users, Target, Plus, RefreshCw, Wallet, CalendarDays } from 'lucide-react';
import { UserProfile, SharedGoal, Account } from '../types';
import { Button, EmptyState, Card, Pill, IconButton, TextInput } from '../shared/components/ui';
import { PartnerConnectionCard } from '../features/partner/PartnerConnectionCard';
import { SharedGoalCard } from '../features/partner/SharedGoalCard';
import { UnlinkPartnerModal } from '../features/partner/UnlinkPartnerModal';
import { PartnerSubNav, PartnerTab } from '../features/partner/PartnerSubNav';
import { SharedAccountCard } from '../features/partner/SharedAccountCard';
import { SharedCalendarView } from '../features/partner/SharedCalendarView';
import { useSharedAccounts } from '../features/partner/useSharedAccounts';

interface PartnerViewProps {
  user: UserProfile | null;
  sharedGoals: SharedGoal[];
  accounts: Account[];
  currency: string;
  onGenerateInviteCode: () => Promise<string>;
  onAcceptInviteCode: (code: string) => Promise<void>;
  onUnlinkPartner: () => Promise<void>;
  onOpenAddGoal: () => void;
  onOpenContributeShared: (sharedGoal: SharedGoal) => void;
  onOpenAuth: () => void;
  onSync?: () => Promise<void>;
}

export const PartnerView: React.FC<PartnerViewProps> = ({
  user, sharedGoals, accounts, currency,
  onGenerateInviteCode, onAcceptInviteCode, onUnlinkPartner,
  onOpenAddGoal, onOpenContributeShared, onOpenAuth, onSync
}) => {
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [tab, setTab] = useState<PartnerTab>('accounts');
  const [newAcctName, setNewAcctName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const isConnected = !!(user?.partner || user?.partnerId);
  const shared = useSharedAccounts(isConnected);
  if (!user) {
    return (
      <div className="p-8 sm:p-12 text-center bg-light-card dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border shadow-sm max-w-lg mx-auto animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-dark-primaryLight dark:bg-dark-primaryLight text-dark-primary dark:text-dark-primary mx-auto flex items-center justify-center mb-4">
          <Users className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Partner Connection</h2>
        <p className="text-sm text-light-textMuted dark:text-dark-textMuted mt-2 mb-6">Log in or create a cloud account to connect with your partner and save towards shared goals together.</p>
        <Button onClick={onOpenAuth} variant="primary" className="px-6 py-3">Sign In / Create Account</Button>
      </div>
    );
  }
  const activeGoals = useMemo(() => sharedGoals.filter((g) => (g.percentage ?? 0) < 100 && !g.isArchived), [sharedGoals]);
  const finishedGoals = useMemo(() => sharedGoals.filter((g) => (g.percentage ?? 0) >= 100 || g.isArchived), [sharedGoals]);
  const handleUnlink = async () => {
    setIsSubmitting(true);
    try { await onUnlinkPartner(); setShowUnlinkModal(false); }
    catch (err: any) { setError(err.message || 'Failed to unlink partner'); }
    finally { setIsSubmitting(false); }
  };
  const handleSyncPress = async () => {
    if (!onSync) return;
    setIsSyncing(true);
    try { await onSync(); await shared.refresh(); }
    catch (err: any) { setError(err.message || 'Failed to sync partner data'); }
    finally { setIsSyncing(false); }
  };
  const handleCreate = async () => {
    const name = newAcctName.trim();
    if (!name) { setError('Give the shared account a name first.'); return; }
    setIsCreating(true);
    try { await shared.createAccount(name); setNewAcctName(''); }
    catch (err: any) { setError(err?.message || 'Failed to create shared account'); }
    finally { setIsCreating(false); }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">Partner Connection</h2>
          <p className="text-xs sm:text-sm text-light-textMuted dark:text-dark-textMuted">Collaborate on finances and track shared goals</p>
        </div>
        {onSync && (
          <Button onClick={handleSyncPress} disabled={isSyncing} isLoading={isSyncing} variant="outline" size="sm" className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" /><span>Sync</span>
          </Button>
        )}
      </div>
      {error && (<div className="p-3 text-sm rounded-lg bg-dark-expenseLight/20 dark:bg-dark-expenseLight/20 text-dark-expense dark:text-dark-expense border border-dark-expense/30">{error}</div>)}
      <PartnerConnectionCard user={user} onGenerateInviteCode={onGenerateInviteCode} onAcceptInviteCode={onAcceptInviteCode} onOpenUnlinkModal={() => setShowUnlinkModal(true)} onError={setError} />
      {!isConnected ? (
        <EmptyState title="Connect with your Partner" description="Connect with a partner above to unlock shared accounts, goals and calendar." />
      ) : (
        <>
          <PartnerSubNav active={tab} onChange={setTab} counts={{ accounts: shared.sharedAccounts.length, goals: activeGoals.length, finished: finishedGoals.length }} />
          {tab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-dark-success" />
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Shared Accounts</h3>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <TextInput value={newAcctName} onChange={(e) => setNewAcctName(e.target.value)} placeholder="New shared account name (e.g. Household)" className="flex-1" />
                <Button onClick={handleCreate} disabled={isCreating} isLoading={isCreating} size="sm" className="flex items-center gap-1.5 whitespace-nowrap"><Plus className="w-4 h-4" /><span>Create</span></Button>
              </div>
              {shared.isLoading ? (<p className="text-sm text-light-textMuted dark:text-dark-textMuted">Loading shared accounts...</p>)
              : shared.isBackendPending ? (
                <EmptyState title="Shared accounts coming soon" description="The shared-accounts backend is not deployed yet (parallel task). Your shared goals below keep working - please check back after the backend lands." />
              ) : shared.error ? (
                <EmptyState title="Could not load shared accounts" description={shared.error} actionLabel="Retry" onAction={() => shared.refresh()} />
              ) : shared.sharedAccounts.length === 0 ? (
                <EmptyState title="No shared accounts yet" description="Create a shared account to pool money with your partner for bills, groceries and more." />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {shared.sharedAccounts.map((a) => (
                    <SharedAccountCard key={a.id} account={a} ownAccounts={accounts} currency={currency} onDeposit={shared.deposit} onExpense={shared.recordExpense} onError={setError} />
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === 'goals' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-dark-primary" />
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Shared Savings Goals</h3>
                </div>
                <Button onClick={onOpenAddGoal} size="sm" variant="primary" className="flex items-center gap-1.5"><Plus className="w-4 h-4" /><span>New Shared Goal</span></Button>
              </div>
              {activeGoals.length === 0 ? (
                <EmptyState title="No active shared goals" description="Create a shared savings goal to begin tracking your financial journey together." actionLabel="Create Shared Goal" onAction={onOpenAddGoal} />
              ) : (
                <div className="space-y-4">{activeGoals.map((goal) => (<SharedGoalCard key={goal.id} goal={goal} user={user} currency={currency} onContribute={onOpenContributeShared} />))}</div>
              )}
            </div>
          )}
          {tab === 'finished' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-dark-success" />
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Finished Goals</h3>
              </div>
              {finishedGoals.length === 0 ? (
                <EmptyState title="Nothing finished yet" description="Goals at 100% or archived will appear here with a Completed badge." />
              ) : (
                <div className="space-y-4">{finishedGoals.map((goal) => (<SharedGoalCard key={goal.id} goal={goal} user={user} currency={currency} onContribute={onOpenContributeShared} hideContribute />))}</div>
              )}
            </div>
          )}
          {tab === 'calendar' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-5 h-5 text-dark-primary" />
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Shared Calendar</h3>
              </div>
              <SharedCalendarView sharedGoals={sharedGoals} sharedAccounts={shared.sharedAccounts} currency={currency} />
            </div>
          )}
        </>
      )}
      <UnlinkPartnerModal isOpen={showUnlinkModal} isSubmitting={isSubmitting} onClose={() => setShowUnlinkModal(false)} onConfirm={handleUnlink} />
    </div>
  );
};
