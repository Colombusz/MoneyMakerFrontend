import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { RecurringView } from './views/RecurringView';
import { GoalsView } from './views/GoalsView';
import { PartnerView } from './views/PartnerView';
import { VacationView } from './views/VacationView';
import { PastVacationsView } from './views/PastVacationsView';
import { LandingPageView } from './views/LandingPageView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddAccountModal } from './components/AddAccountModal';
import { AddRecurringModal } from './components/AddRecurringModal';
import { AddGoalModal } from './components/AddGoalModal';
import { ContributeModal } from './components/ContributeModal';
import { AuthModal } from './components/AuthModal';
import { CashQuickSpendModal } from './features/accounts/CashQuickSpendModal';
import { Account } from './types';
import { useAppState } from './hooks/useAppState';
import { getStoredAccessToken } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    return !getStoredAccessToken();
  });

  // Modal Visibility States
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cashQuickSpendAccount, setCashQuickSpendAccount] = useState<Account | null>(null);
  const [contributeTarget, setContributeTarget] = useState<{
    goalId: string;
    goalName: string;
    isShared: boolean;
  } | null>(null);

  const {
    user,
    accounts,
    categories,
    transactions,
    recurringRules,
    occurrences,
    goals,
    sharedGoals,
    currency,
    handleSync,
    handleAddTransaction,
    handleDeleteTransaction,
    handleAddAccount,
    handleAddRecurring,
    handlePayOccurrence,
    handleSkipOccurrence,
    handleDeleteRule,
    handleAddGoal,
    handleContribute,
    handleGenerateInviteCode,
    handleAcceptInviteCode,
    handleUnlinkPartner
  } = useAppState();

  useEffect(() => {
    if (user) {
      setShowLanding(false);
    }
  }, [user]);

  if (showLanding && !user) {
    return (
      <>
        <LandingPageView
          onChooseGuest={() => setShowLanding(false)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            accounts={accounts}
            transactions={transactions}
            categories={categories}
            currency={currency}
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
            onOpenAddAccount={() => setIsAddAccountOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenCashQuickSpend={(acc) => setCashQuickSpendAccount(acc)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            transactions={transactions}
            categories={categories}
            recurringOccurrences={occurrences}
            accounts={accounts}
            currency={currency}
            isAuthenticated={!!user}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringView
            recurringRules={recurringRules}
            occurrences={occurrences}
            categories={categories}
            accounts={accounts}
            currency={currency}
            onOpenAddRecurring={() => setIsAddRecurringOpen(true)}
            onPayOccurrence={handlePayOccurrence}
            onSkipOccurrence={handleSkipOccurrence}
            onDeleteRule={handleDeleteRule}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            accounts={accounts}
            currency={currency}
            onOpenAddGoal={() => setIsAddGoalOpen(true)}
            onOpenContribute={(goal) =>
              setContributeTarget({
                goalId: goal.id,
                goalName: goal.name,
                isShared: false
              })
            }
          />
        )}

        {activeTab === 'partner' && (
          <PartnerView
            user={user}
            sharedGoals={sharedGoals}
            accounts={accounts}
            currency={currency}
            onGenerateInviteCode={handleGenerateInviteCode}
            onAcceptInviteCode={handleAcceptInviteCode}
            onUnlinkPartner={handleUnlinkPartner}
            onOpenAddGoal={() => setIsAddGoalOpen(true)}
            onOpenContributeShared={(sharedGoal) =>
              setContributeTarget({
                goalId: sharedGoal.id,
                goalName: sharedGoal.name,
                isShared: true
              })
            }
            onOpenAuth={() => setIsAuthOpen(true)}
            onSync={handleSync}
          />
        )}

        {activeTab === 'vacation' && (
          <VacationView
            user={user}
            accounts={accounts}
            currency={currency}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigatePastVacations={() => setActiveTab('past-vacations')}
          />
        )}

        {activeTab === 'past-vacations' && (
          <PastVacationsView
            user={user}
            currency={currency}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateActiveVacations={() => setActiveTab('vacation')}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
      />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        accounts={accounts}
        categories={categories}
        onAddTransaction={handleAddTransaction}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAddAccount={handleAddAccount}
      />

      <AddRecurringModal
        isOpen={isAddRecurringOpen}
        onClose={() => setIsAddRecurringOpen(false)}
        accounts={accounts}
        categories={categories}
        onAddRecurring={handleAddRecurring}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        accounts={accounts}
        isPartnerConnected={!!user?.partner}
        onAddGoal={handleAddGoal}
      />

      {contributeTarget && (
        <ContributeModal
          isOpen={!!contributeTarget}
          onClose={() => setContributeTarget(null)}
          goalName={contributeTarget.goalName}
          goalId={contributeTarget.goalId}
          isShared={contributeTarget.isShared}
          accounts={accounts}
          onContribute={handleContribute}
        />
      )}

      <CashQuickSpendModal
        isOpen={!!cashQuickSpendAccount}
        onClose={() => setCashQuickSpendAccount(null)}
        account={cashQuickSpendAccount}
        categories={categories}
        currency={currency}
        onAddTransaction={handleAddTransaction}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
