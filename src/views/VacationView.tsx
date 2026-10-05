import React, { useState, useEffect, useMemo } from 'react';
import {
  Palmtree,
  Plus,
  Users,
  Copy,
  Check,
  CreditCard,
  PieChart,
  History,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  LogOut,
  Sparkles,
  Archive,
  ChevronRight,
  Receipt,
  HeartHandshake,
  Undo2,
  Clock
} from 'lucide-react';
import { UserProfile, Account, Vacation, VacationChipIn, VacationExpenseItem, VacationLoggedExpense, VacationTransactionLog } from '../types';
import { Button } from '../shared/components/ui/Button';
import { Card } from '../shared/components/ui/Card';
import { Pill } from '../shared/components/ui/Pill';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { formatCentavos } from '../shared/utils/currency';
import { vacationApi, VacationDetailResponse } from '../services/vacationApi';
import {
  CreateVacationModal,
  JoinVacationModal,
  DepositVacationModal,
  CreateExpenseItemModal,
  LogPersonalExpenseModal,
  CreateChipInModal,
  ContributeChipInModal,
  RefundModal,
  ReverseLogModal
} from '../features/vacation/VacationModals';

interface VacationViewProps {
  user: UserProfile | null;
  accounts: Account[];
  currency: string;
  onOpenAuth: () => void;
  onNavigatePastVacations: () => void;
}

export const VacationView: React.FC<VacationViewProps> = ({
  user,
  accounts,
  currency,
  onOpenAuth,
  onNavigatePastVacations
}) => {
  const [activeVacations, setActiveVacations] = useState<Vacation[]>([]);
  const [selectedVacationId, setSelectedVacationId] = useState<string | null>(null);
  const [vacationDetails, setVacationDetails] = useState<VacationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal Visibility States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [isCreateChipInOpen, setIsCreateChipInOpen] = useState(false);
  const [activeChipInToContribute, setActiveChipInToContribute] = useState<VacationChipIn | null>(null);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [activeLogToReverse, setActiveLogToReverse] = useState<VacationTransactionLog | null>(null);

  const isMaster = useMemo(() => {
    if (!vacationDetails || !user) return false;
    const member = vacationDetails.vacation.members.find((m) => m.userId === user.id);
    return member?.role === 'master';
  }, [vacationDetails, user]);

  const fetchVacations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await vacationApi.getActiveVacations();
      setActiveVacations(list);
      if (list.length > 0) {
        const targetId = selectedVacationId && list.some((v) => v._id === selectedVacationId)
          ? selectedVacationId
          : list[0]._id;
        setSelectedVacationId(targetId);
        await loadVacationDetails(targetId);
      } else {
        setSelectedVacationId(null);
        setVacationDetails(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load vacations');
    } finally {
      setLoading(false);
    }
  };

  const loadVacationDetails = async (id: string) => {
    try {
      const details = await vacationApi.getVacationById(id);
      setVacationDetails(details);
    } catch (err: any) {
      setError(err?.message || 'Failed to load vacation details');
    }
  };

  useEffect(() => {
    fetchVacations();
  }, [user]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateVacation = async (name: string, description?: string) => {
    const created = await vacationApi.createVacation(name, description);
    await fetchVacations();
    setSelectedVacationId(created._id);
    await loadVacationDetails(created._id);
  };

  const handleJoinVacation = async (code: string) => {
    const joined = await vacationApi.joinVacation(code);
    await fetchVacations();
    setSelectedVacationId(joined._id);
    await loadVacationDetails(joined._id);
  };

  const handleDeposit = async (amountCentavos: number, fromAccountId: string, notes?: string) => {
    if (!selectedVacationId) return;
    await vacationApi.deposit(selectedVacationId, amountCentavos, fromAccountId, notes);
    await loadVacationDetails(selectedVacationId);
  };

  const handleCreateExpense = async (
    title: string,
    amountCentavos: number,
    category?: string,
    notes?: string,
    deductionSource?: 'pool' | 'chip_in',
    chipInId?: string
  ) => {
    if (!selectedVacationId) return;
    await vacationApi.createExpenseItem(
      selectedVacationId,
      title,
      amountCentavos,
      category,
      notes,
      deductionSource,
      chipInId
    );
    await loadVacationDetails(selectedVacationId);
  };

  const handleLogPersonalExpense = async (
    title: string,
    amountCentavos: number,
    fromAccountId: string,
    category?: string,
    notes?: string
  ) => {
    if (!selectedVacationId) return;
    await vacationApi.logPersonalExpense(selectedVacationId, title, amountCentavos, fromAccountId, category, notes);
    await loadVacationDetails(selectedVacationId);
  };

  const handleCreateChipIn = async (title: string, targetAmountCentavos?: number, description?: string) => {
    if (!selectedVacationId) return;
    await vacationApi.createChipIn(selectedVacationId, title, targetAmountCentavos, description);
    await loadVacationDetails(selectedVacationId);
  };

  const handleContributeChipIn = async (chipInId: string, amountCentavos: number, fromAccountId: string, notes?: string) => {
    if (!selectedVacationId) return;
    await vacationApi.contributeChipIn(selectedVacationId, chipInId, amountCentavos, fromAccountId, notes);
    await loadVacationDetails(selectedVacationId);
  };

  const handleRefund = async (
    memberUserId: string,
    amountCentavos: number,
    notes?: string,
    refundSource?: 'pool' | 'chip_in',
    chipInId?: string | null
  ) => {
    if (!selectedVacationId) return;
    await vacationApi.refund(
      selectedVacationId,
      memberUserId,
      amountCentavos,
      undefined,
      notes,
      refundSource,
      chipInId
    );
    await loadVacationDetails(selectedVacationId);
  };

  const handleReverseLog = async (logId: string, reason: string) => {
    if (!selectedVacationId) return;
    await vacationApi.reverseLog(selectedVacationId, logId, reason);
    await loadVacationDetails(selectedVacationId);
  };

  const handleConclude = async () => {
    if (!selectedVacationId || !vacationDetails) return;
    const hasUnrefundedChipIn = vacationDetails.chipIns?.some((c) => {
      const remaining =
        c.totalCollectedCentavos - (c.totalSpentCentavos || 0) - (c.totalRefundedCentavos || 0);
      return remaining > 0;
    });

    if (vacationDetails.vacation.balanceCentavos !== 0 || hasUnrefundedChipIn) {
      alert(
        `Cannot conclude vacation while balances are not zero (Pool: ${formatCentavos(
          vacationDetails.vacation.balanceCentavos,
          currency
        )}). Please refund remaining pool and chip-in funds or record remaining expenses.`
      );
      return;
    }
    const confirmed = window.confirm(
      'Are you sure you want to conclude this vacation? It will become read-only and move to Past Vacations.'
    );
    if (!confirmed) return;

    try {
      await vacationApi.conclude(selectedVacationId);
      await fetchVacations();
      onNavigatePastVacations();
    } catch (err: any) {
      alert(err?.message || 'Failed to conclude vacation');
    }
  };

  if (!user) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-lg mx-auto animate-fade-in my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Palmtree className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Vacation Mode</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-6">
          Sign in to pool travel money with your friends or family, track shared spending transparently, and refund leftover funds when the trip concludes.
        </p>
        <Button onClick={onOpenAuth} variant="primary" className="px-6 py-3 min-h-[44px]">
          Sign In / Create Account
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Vacation Mode
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shared expense pooling, real-time balances, and fair refunds
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigatePastVacations}
            className="flex items-center gap-1.5 min-h-[40px]"
          >
            <Archive className="w-4 h-4 text-slate-500" />
            <span>Past Vacations</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-1.5 min-h-[40px]"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Join with Code</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Vacation</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          {error}
        </div>
      )}

      {/* Vacation Selector Tabs (if multiple active vacations) */}
      {activeVacations.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {activeVacations.map((v) => (
            <button
              key={v._id}
              onClick={() => {
                setSelectedVacationId(v._id);
                loadVacationDetails(v._id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                v._id === selectedVacationId
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {activeVacations.length === 0 ? (
        <Card className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center">
            <Palmtree className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No Active Vacations
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Going on a trip? Create a vacation to pool money into a dedicated account, or join an existing trip using a 6-character code.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => setIsJoinOpen(true)} className="min-h-[44px]">
              Join Vacation
            </Button>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)} className="min-h-[44px]">
              Start Vacation
            </Button>
          </div>
        </Card>
      ) : vacationDetails ? (
        <div className="space-y-6">
          {/* Active Vacation Header & Balance Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Vacation Overview Card */}
            <Card className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl shadow-md lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                        {isMaster ? 'Vacation Master' : 'Member'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/30 text-emerald-100">
                        Active Pool
                      </span>
                    </div>
                    <h2 className="text-2xl font-black mt-2 tracking-tight">
                      {vacationDetails.vacation.name}
                    </h2>
                    {vacationDetails.vacation.description && (
                      <p className="text-xs text-amber-100/90 mt-1 line-clamp-2">
                        {vacationDetails.vacation.description}
                      </p>
                    )}
                  </div>

                  {/* Join Code Pill */}
                  <button
                    onClick={() => handleCopyCode(vacationDetails.vacation.joinCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-mono font-bold backdrop-blur-sm border border-white/20"
                    title="Click to copy join code"
                  >
                    <span>Code: {vacationDetails.vacation.joinCode}</span>
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Balance Display */}
                <div className="mt-6">
                  <span className="text-xs font-medium text-amber-100 uppercase tracking-wider">
                    Current Vacation Account Balance
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-0.5">
                    {formatCentavos(vacationDetails.vacation.balanceCentavos, currency)}
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Card */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/20 flex-wrap">
                <Button
                  onClick={() => setIsDepositOpen(true)}
                  className="bg-white text-amber-700 hover:bg-amber-50 active:bg-amber-100 shadow-sm font-bold min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Deposit Funds</span>
                </Button>

                <Button
                  onClick={() => setIsLogExpenseOpen(true)}
                  className="bg-amber-700/40 hover:bg-amber-700/60 text-white border border-white/30 backdrop-blur-sm font-semibold min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Log Personal Expense</span>
                </Button>

                {isMaster && (
                  <Button
                    onClick={handleConclude}
                    className="bg-rose-500/80 hover:bg-rose-600 text-white border border-white/30 font-semibold min-h-[44px] sm:ml-auto flex items-center justify-center gap-1.5"
                    title="Conclude vacation (requires balance to be exactly 0)"
                  >
                    <Check className="w-4 h-4" />
                    <span>Conclude Trip</span>
                  </Button>
                )}
              </div>
            </Card>

            {/* Members List Card */}
            <Card className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>Members ({vacationDetails.vacation.members.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Share code to invite</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {vacationDetails.vacation.members.map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <span>{m.name}</span>
                            {m.userId === user?.id && <span className="text-[10px] text-slate-400 font-normal">(You)</span>}
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize">{m.role}</p>
                        </div>
                      </div>
                      {m.role === 'master' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          Master
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Member
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Master Controls Actions */}
              {isMaster && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Master Controls
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsExpenseOpen(true)}
                      className="text-xs font-semibold flex items-center justify-center gap-1 min-h-[38px]"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                      <span>Spend Pool</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreateChipInOpen(true)}
                      className="text-xs font-semibold flex items-center justify-center gap-1 min-h-[38px]"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-purple-500" />
                      <span>Request Chip-in</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRefundOpen(true)}
                      className="text-xs font-semibold col-span-2 flex items-center justify-center gap-1 min-h-[38px]"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Refund Leftover Funds</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Chip-In Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Chip-in Items ({vacationDetails.chipIns.length})
                </h3>
              </div>
              {isMaster && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateChipInOpen(true)}
                  className="flex items-center gap-1 text-xs min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chip-in</span>
                </Button>
              )}
            </div>

            {vacationDetails.chipIns.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                No active chip-in items. The Vacation Master can create chip-ins when the group needs to pitch in for meals, rentals, or tickets.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {vacationDetails.chipIns.map((ci) => {
                  const target = ci.targetAmountCentavos || 0;
                  const collected = ci.totalCollectedCentavos;
                  const spent = ci.totalSpentCentavos || 0;
                  const available = Math.max(0, collected - spent);
                  const percent = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 100;
                  return (
                    <Card
                      key={ci._id}
                      className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ci.title}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                            {ci.status}
                          </span>
                        </div>
                        {ci.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {ci.description}
                          </p>
                        )}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Collected:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {formatCentavos(collected, currency)}
                              {target > 0 && ` / ${formatCentavos(target, currency)}`}
                            </span>
                          </div>
                          {spent > 0 && (
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-500">Available:</span>
                              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatCentavos(available, currency)}
                              </span>
                            </div>
                          )}
                          {target > 0 && (
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-purple-600 rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setActiveChipInToContribute(ci)}
                        className="w-full text-xs font-bold min-h-[38px]"
                      >
                        Contribute to Chip-in
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Two-column layout: Shared Expenses & Personal Logged Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Shared Expenses (Master deducted from pool or chip-in) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Shared Expenses ({vacationDetails.expenseItems.length})
                  </h3>
                </div>
                {isMaster && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsExpenseOpen(true)}
                    className="text-xs min-h-[36px]"
                  >
                    Add Expense
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {vacationDetails.expenseItems.length === 0 ? (
                  <div className="p-4 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                    No shared expenses recorded yet.
                  </div>
                ) : (
                  vacationDetails.expenseItems.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                          {item.deductionSource === 'chip_in' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                              Chip-in
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                              Main Pool
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {item.category || 'Shared'} &bull; By {item.createdByName} &bull; {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        -{formatCentavos(item.amountCentavos, currency)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Personal Logged Expenses (Records only, doesn't change pool) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-sky-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Your Logged Expenses ({vacationDetails.loggedExpenses.length})
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsLogExpenseOpen(true)}
                  className="text-xs min-h-[36px]"
                >
                  Log Expense
                </Button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {vacationDetails.loggedExpenses.length === 0 ? (
                  <div className="p-4 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                    No personal expenses logged yet. Tap Log Expense to track individual purchases (does not change pool balance).
                  </div>
                ) : (
                  vacationDetails.loggedExpenses.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.category || 'Personal'} &bull; {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {formatCentavos(item.amountCentavos, currency)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Append-Only Transparent Transaction Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Append-Only Transaction Log ({vacationDetails.logs.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Immutable Ledger</span>
            </div>

            <Card className="p-0 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-96 overflow-y-auto">
                {vacationDetails.logs.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No transactions recorded yet.</p>
                ) : (
                  vacationDetails.logs.map((log) => {
                    const isExpenseType = log.type === 'expense';
                    const isDepositType = log.type === 'deposit';
                    const isChipInType = log.type === 'chip_in';
                    const isRefundType = log.type === 'refund';
                    const isReversalType = log.type === 'reversal';

                    return (
                      <div
                        key={log._id}
                        className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isDepositType
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : isExpenseType
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                : isChipInType
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                                : isRefundType
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {isDepositType && <ArrowDownLeft className="w-4 h-4" />}
                            {isExpenseType && <ArrowUpRight className="w-4 h-4" />}
                            {isChipInType && <HeartHandshake className="w-4 h-4" />}
                            {isRefundType && <RefreshCw className="w-4 h-4" />}
                            {isReversalType && <Undo2 className="w-4 h-4" />}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {log.description}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              By {log.userName} &bull; {new Date(log.date || log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isDepositType || isChipInType
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isExpenseType
                                ? 'text-rose-600 dark:text-rose-400'
                                : isRefundType
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {isExpenseType && '-'}
                            {(isDepositType || isChipInType) && '+'}
                            {formatCentavos(log.amountCentavos, currency)}
                          </span>

                          {/* Reversal action for master on mistakes */}
                          {isMaster && log.type !== 'reversal' && log.type !== 'concluded' && (
                            <button
                              onClick={() => setActiveLogToReverse(log)}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Reverse mistake with an offsetting entry"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Modals */}
      <CreateVacationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateVacation}
      />

      <JoinVacationModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSubmit={handleJoinVacation}
      />

      {vacationDetails && (
        <>
          <DepositVacationModal
            isOpen={isDepositOpen}
            onClose={() => setIsDepositOpen(false)}
            accounts={accounts}
            currency={currency}
            onSubmit={handleDeposit}
          />

          <CreateExpenseItemModal
            isOpen={isExpenseOpen}
            onClose={() => setIsExpenseOpen(false)}
            vacationBalanceCentavos={vacationDetails.vacation.balanceCentavos}
            chipIns={vacationDetails.chipIns}
            currency={currency}
            onSubmit={handleCreateExpense}
          />

          <LogPersonalExpenseModal
            isOpen={isLogExpenseOpen}
            onClose={() => setIsLogExpenseOpen(false)}
            accounts={accounts}
            currency={currency}
            onSubmit={handleLogPersonalExpense}
          />

          <CreateChipInModal
            isOpen={isCreateChipInOpen}
            onClose={() => setIsCreateChipInOpen(false)}
            onSubmit={handleCreateChipIn}
          />

          <ContributeChipInModal
            isOpen={!!activeChipInToContribute}
            onClose={() => setActiveChipInToContribute(null)}
            chipIn={activeChipInToContribute}
            accounts={accounts}
            currency={currency}
            onSubmit={handleContributeChipIn}
          />

          <RefundModal
            isOpen={isRefundOpen}
            onClose={() => setIsRefundOpen(false)}
            vacation={vacationDetails.vacation}
            chipIns={vacationDetails.chipIns}
            currency={currency}
            onSubmit={handleRefund}
          />

          <ReverseLogModal
            isOpen={!!activeLogToReverse}
            onClose={() => setActiveLogToReverse(null)}
            log={activeLogToReverse}
            currency={currency}
            onSubmit={handleReverseLog}
          />
        </>
      )}
    </div>
  );
};
