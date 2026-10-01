import type { TransactionType } from '../../types';

export type TransactionTypeFilter = TransactionType | 'all';

/** Client-only UI state shared across screens. */
export interface UiState {
  selectedMonth: string;
  transactionTypeFilter: TransactionTypeFilter;
  categoryFilter: string | null;
  /** Id of a shared bottom sheet / dialog, or null. */
  activeSheet: string | null;
}
