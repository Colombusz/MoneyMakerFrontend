import { Category, Transaction } from '../../types';

/**
 * Single source of truth for how a transaction is *named*.
 *
 * Mirrors `MoneyMakerAndroid/src/shared/utils/transactionLabel.ts` so the web
 * and the app label a record identically. Precedence:
 *
 *   1. the category name (the structured field both platforms always have)
 *   2. shared goal / shared account label (goalId / sharedAccountId)
 *   3. the income `source` / payer
 *   4. the free-text notes
 *   5. a type label as the last resort
 *
 * The free-text detail that did *not* win the title is returned separately so
 * it can still be rendered as a subtitle.
 */

export interface TransactionLabel {
  /** Primary label, e.g. "Salary" or "sgabu". */
  title: string;
  /** Secondary free-text detail, or null when the title already used it. */
  detail: string | null;
}

const TYPE_LABEL: Record<Transaction['type'], string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
};

const firstNonEmpty = (...values: Array<string | null | undefined>): string | null => {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
};

export const getTransactionLabel = (
  transaction: Pick<
    Transaction,
    'type' | 'categoryId' | 'source' | 'notes' | 'goalId' | 'sharedAccountId'
  >,
  category?: Category
): TransactionLabel => {
  // Shared goal / shared account contributions have no category but carry
  // a goalId or sharedAccountId — give them a semantic label instead of
  // falling through to "Uncategorized" / "Expense".
  if (transaction.goalId) {
    return { title: 'Shared Goal Contribution', detail: transaction.notes ?? null };
  }
  if (transaction.sharedAccountId) {
    return { title: 'Shared Account Deposit', detail: transaction.notes ?? null };
  }

  const title =
    firstNonEmpty(category?.name, transaction.source, transaction.notes) ??
    TYPE_LABEL[transaction.type];

  // Whatever free text lost the title race is still worth showing underneath.
  const detail = firstNonEmpty(
    transaction.source !== title ? transaction.source : null,
    transaction.notes !== title ? transaction.notes : null
  );

  return { title, detail: detail === title ? null : detail };
};

/** Convenience wrapper when only the primary label is needed. */
export const getTransactionTitle = (
  transaction: Pick<
    Transaction,
    'type' | 'categoryId' | 'source' | 'notes' | 'goalId' | 'sharedAccountId'
  >,
  category?: Category
): string => getTransactionLabel(transaction, category).title;