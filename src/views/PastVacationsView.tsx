import React, { useState, useEffect } from 'react';
import { Archive, Palmtree, ArrowLeft, CheckCircle2, Calendar, ChevronRight, ShieldAlert, DollarSign } from 'lucide-react';
import { UserProfile, Vacation, PastVacationSummary } from '../types';
import { Button } from '../shared/components/ui/Button';
import { Card } from '../shared/components/ui/Card';
import { formatCentavos } from '../shared/utils/currency';
import { vacationApi } from '../services/vacationApi';
import { PastVacationSummaryModal } from '../features/vacation/VacationModals';

interface PastVacationsViewProps {
  user: UserProfile | null;
  currency: string;
  onOpenAuth: () => void;
  onNavigateActiveVacations: () => void;
}

export const PastVacationsView: React.FC<PastVacationsViewProps> = ({
  user,
  currency,
  onOpenAuth,
  onNavigateActiveVacations
}) => {
  const [pastVacations, setPastVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<PastVacationSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchPastVacations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await vacationApi.getPastVacations();
      setPastVacations(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load past vacations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastVacations();
  }, [user]);

  const handleOpenSummary = async (vacationId: string) => {
    setSummaryLoading(true);
    try {
      const summary = await vacationApi.getPastVacationSummary(vacationId);
      setSelectedSummary(summary);
    } catch (err: any) {
      alert(err?.message || 'Failed to open past vacation summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-lg mx-auto animate-fade-in my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Archive className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Past Vacations</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-6">
          Sign in to view your archive of completed trips and personal expense summaries.
        </p>
        <Button onClick={onOpenAuth} variant="primary" className="px-6 py-3 min-h-[44px]">
          Sign In / Create Account
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateActiveVacations}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Back to Active Vacation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Past Vacations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Concluded trips archive with private personal spending records
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateActiveVacations}
          className="flex items-center gap-1.5 self-start sm:self-auto min-h-[40px]"
        >
          <Palmtree className="w-4 h-4 text-amber-500" />
          <span>Active Vacations</span>
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          {error}
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
            Personal Privacy Isolation
          </span>
          Opening a concluded vacation shows <strong>only your own logged expenses and chip-in contributions</strong>. Other members' personal expense details remain strictly private.
        </div>
      </div>

      {/* Vacations List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading past vacations...</div>
      ) : pastVacations.length === 0 ? (
        <Card className="p-10 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 mx-auto flex items-center justify-center">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No Past Vacations Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            When a vacation account balance is brought to zero and the Vacation Master concludes the trip, it will appear here in read-only mode.
          </p>
          <div className="pt-2">
            <Button variant="outline" onClick={onNavigateActiveVacations} className="min-h-[44px]">
              Go to Active Vacations
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastVacations.map((v) => (
            <Card
              key={v._id}
              onClick={() => handleOpenSummary(v._id)}
              className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Palmtree className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {v.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Concluded
                  </span>
                </div>

                {v.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {v.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-3">
                  <span>Code: {v.joinCode}</span>
                  <span>&bull;</span>
                  <span>{v.members.length} members</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">
                  {v.concludedAt ? `Concluded on ${new Date(v.concludedAt).toLocaleDateString()}` : 'Archived'}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  <span>View Your Records</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Past Vacation Summary Modal */}
      <PastVacationSummaryModal
        isOpen={!!selectedSummary}
        onClose={() => setSelectedSummary(null)}
        summary={selectedSummary}
        currency={currency}
      />
    </div>
  );
};
