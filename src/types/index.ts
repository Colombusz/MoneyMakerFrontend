export type AccountType = 'savings' | 'payroll' | 'goals' | 'cash' | 'other';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type OverrideStatus = 'skipped' | 'paid' | 'modified';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  currency: string;
  partnerId?: string | null;
  partner?: {
    id: string;
    name: string;
    email?: string;
  } | null;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  startingBalanceCentavos: number;
  currentBalanceCentavos: number;
  isArchived: boolean;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amountCentavos: number;
  categoryId?: string | null;
  source?: string | null;
  destinationAccountId?: string | null;
  date: string;
  notes?: string;
  receiptImageUrl?: string | null;
  receiptPublicId?: string | null;
  recurringRuleId?: string | null;
  recurringOccurrenceDate?: string | null;
  goalId?: string | null;
  sharedAccountId?: string | null;
  updatedAt: string;
}

export interface DayNote {
  id: string;
  userId: string;
  /** UTC midnight of the calendar day this note belongs to. */
  date: string;
  notes: string;
  updatedAt: string;
}

export interface RecurringRule {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: 'expense' | 'income';
  amountCentavos: number;
  frequency: RecurringFrequency;
  intervalDays?: number | null;
  startDate: string;
  endDate?: string | null;
  maxOccurrences?: number | null;
  notes?: string;
  updatedAt: string;
}

export interface WebProjectedOccurrence {
  ruleId: string;
  date: string; // YYYY-MM-DD
  amountCentavos: number;
  accountId: string;
  categoryId: string;
  type: 'expense' | 'income';
  notes: string;
  status: 'pending' | 'skipped' | 'paid' | 'modified';
  transactionId?: string | null;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmountCentavos: number;
  targetDate?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  linkedAccountId?: string | null;
  isShared: boolean;
  sharedGoalId?: string | null;
  contributionsTotalCentavos?: number;
  totalSavedCentavos?: number;
  remainingCentavos?: number;
  percentage?: number;
  projectedCompletionDate?: string | null;
  updatedAt: string;
}

export interface SharedGoalMember {
  userId: string;
  name: string;
  role: 'owner' | 'member';
  status: 'active' | 'left';
  totalContributedCentavos: number;
}

export interface SharedGoalContributionItem {
  id: string;
  userId: string;
  contributorName: string;
  amountCentavos: number;
  date: string;
  notes?: string;
}

export interface SharedGoal {
  id: string;
  name: string;
  targetAmountCentavos: number;
  targetDate?: string | null;
  imageUrl?: string | null;
  createdByUserId: string;
  isArchived: boolean;
  totalSavedCentavos: number;
  remainingCentavos: number;
  percentage: number;
  members: SharedGoalMember[];
  recentContributions: SharedGoalContributionItem[];
  updatedAt: string;
}

export interface MonthSummary {
  year: number;
  month: number;
  totalIncomeCentavos: number;
  totalExpenseCentavos: number;
  netCentavos: number;
  categoryTotals: Record<string, number>;
  dailyBreakdown: Record<
    string,
    { incomeCentavos: number; expenseCentavos: number; count: number }
  >;
}

// ==========================================
// Vacation Mode Types
// ==========================================

export type VacationRole = 'master' | 'member';
export type VacationStatus = 'active' | 'concluded';
export type VacationLogType = 'deposit' | 'expense' | 'chip_in' | 'refund' | 'reversal' | 'concluded';

export interface VacationMember {
  userId: string;
  name: string;
  role: VacationRole;
  joinedAt: string;
}

export interface Vacation {
  _id: string;
  name: string;
  description?: string;
  joinCode: string;
  creatorUserId: string;
  status: VacationStatus;
  members: VacationMember[];
  balanceCentavos: number;
  concludedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type VacationExpenseDeductionSource = 'pool' | 'chip_in';

export interface VacationExpenseItem {
  _id: string;
  vacationId: string;
  createdByUserId: string;
  createdByName: string;
  title: string;
  amountCentavos: number;
  category?: string | null;
  deductionSource?: VacationExpenseDeductionSource;
  chipInId?: string | null;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface VacationLoggedExpense {
  _id: string;
  vacationId: string;
  userId: string;
  userName: string;
  title: string;
  amountCentavos: number;
  category?: string | null;
  fromAccountId?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface VacationChipInContribution {
  _id: string;
  chipInId: string;
  vacationId: string;
  userId: string;
  userName: string;
  amountCentavos: number;
  fromAccountId?: string;
  date: string;
  notes?: string;
}

export interface VacationChipIn {
  _id: string;
  vacationId: string;
  createdByUserId: string;
  createdByName: string;
  title: string;
  targetAmountCentavos?: number | null;
  totalCollectedCentavos: number;
  totalSpentCentavos?: number;
  totalRefundedCentavos?: number;
  description?: string;
  status: 'open' | 'closed';
  contributions: VacationChipInContribution[];
  createdAt: string;
}

export interface VacationTransactionLog {
  _id: string;
  vacationId: string;
  type: VacationLogType;
  userId: string;
  userName: string;
  amountCentavos: number;
  description: string;
  relatedItemId?: string | null;
  date: string;
  createdAt: string;
}

export interface PastVacationSummary {
  vacation: {
    _id: string;
    name: string;
    description?: string;
    joinCode: string;
    creatorUserId: string;
    status: VacationStatus;
    createdAt: string;
    concludedAt?: string | null;
  };
  sharedExpenses: VacationExpenseItem[];
  myLoggedExpenses: VacationLoggedExpense[];
  myChipIns: VacationChipIn[];
  summary: {
    totalSharedExpensesCentavos: number;
    myLoggedExpensesCentavos: number;
    myChipInContributionsCentavos: number;
    myDepositsCentavos: number;
    myRefundsCentavos: number;
    myTotalSpentCentavos: number;
  };
}

