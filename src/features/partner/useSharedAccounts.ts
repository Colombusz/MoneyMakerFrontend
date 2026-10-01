import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../shared/services/apiClient';

export interface SharedAccountMemberTotal {
  userId: string;
  name: string;
  totalDepositedCentavos: number;
  totalSpentCentavos: number;
}

export interface SharedAccountMovement {
  id: string;
  type: 'deposit' | 'expense';
  userId: string;
  userName?: string;
  amountCentavos: number;
  date: string;
  notes?: string;
  fundingAccountId?: string | null;
  fundingAccountName?: string | null;
}

export interface SharedAccount {
  id: string;
  name: string;
  balanceCentavos: number;
  members: SharedAccountMemberTotal[];
  recentMovements: SharedAccountMovement[];
  updatedAt?: string;
}

const toNum = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;
const toStr = (v: unknown, fb = ''): string =>
  typeof v === 'string' ? v : fb;

function normMovement(raw: any, idx: number): SharedAccountMovement {
  return {
    id: toStr(raw?.id ?? raw?._id, `mov-${idx}`),
    type: raw?.type === 'expense' ? 'expense' : 'deposit',
    userId: toStr(raw?.userId),
    userName: raw?.userName ?? raw?.contributorName,
    amountCentavos: toNum(raw?.amountCentavos ?? raw?.amount),
    date: toStr(raw?.date, new Date().toISOString()),
    notes: raw?.notes,
    fundingAccountId: raw?.fundingAccountId ?? raw?.privateAccountId ?? null,
    fundingAccountName: raw?.fundingAccountName ?? raw?.privateAccountName ?? null
  };
}

function normAccount(raw: any, idx: number): SharedAccount {
  const mSrc: any[] = Array.isArray(raw?.members)
    ? raw.members
    : Array.isArray(raw?.memberTotals)
      ? raw.memberTotals
      : [];
  const movSrc: any[] = Array.isArray(raw?.recentMovements)
    ? raw.recentMovements
    : Array.isArray(raw?.movements)
      ? raw.movements
      : [];
  return {
    id: toStr(raw?.id ?? raw?._id, `shared-acct-${idx}`),
    name: toStr(raw?.name, 'Shared account'),
    balanceCentavos: toNum(raw?.balanceCentavos ?? raw?.balance ?? raw?.currentBalanceCentavos),
    members: mSrc.map((m: any) => ({
      userId: toStr(m?.userId),
      name: toStr(m?.name, 'Member'),
      totalDepositedCentavos: toNum(m?.totalDepositedCentavos ?? m?.totalContributedCentavos),
      totalSpentCentavos: toNum(m?.totalSpentCentavos)
    })),
    recentMovements: movSrc.map(normMovement),
    updatedAt: raw?.updatedAt
  };
}

const isNotFound = (err: unknown): boolean =>
  /404|not found|Cannot GET/i.test(err instanceof Error ? err.message : String(err ?? ''));

export function useSharedAccounts(isConnected: boolean) {
  const [sharedAccounts, setSharedAccounts] = useState<SharedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendPending, setIsBackendPending] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isConnected) {
      setSharedAccounts([]);
      setIsBackendPending(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiFetch<any>('/api/partners/shared-accounts');
      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.sharedAccounts)
          ? data.sharedAccounts
          : Array.isArray(data?.accounts)
            ? data.accounts
            : [];
      setSharedAccounts(list.map(normAccount));
      setIsBackendPending(false);
      setError('');
    } catch (err: any) {
      setSharedAccounts([]);
      if (isNotFound(err)) {
        setIsBackendPending(true);
        setError('');
      } else {
        setIsBackendPending(false);
        setError(err?.message || 'Failed to load shared accounts');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createAccount = useCallback(
    async (name: string) => {
      await apiFetch('/api/partners/shared-accounts', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      await refresh();
    },
    [refresh]
  );

  const deposit = useCallback(
    async (sharedAccountId: string, amountCentavos: number, fundingAccountId: string, notes?: string) => {
      await apiFetch(`/api/partners/shared-accounts/${sharedAccountId}/deposit`, {
        method: 'POST',
        // Backend zod schema requires `fromAccountId`; also send the
        // `fundingAccountId` alias for forwards compatibility.
        body: JSON.stringify({ amountCentavos, fromAccountId: fundingAccountId, fundingAccountId, notes })
      });
      await refresh();
    },
    [refresh]
  );

  const recordExpense = useCallback(
    async (sharedAccountId: string, amountCentavos: number, notes?: string, categoryId?: string) => {
      await apiFetch(`/api/partners/shared-accounts/${sharedAccountId}/expense`, {
        method: 'POST',
        body: JSON.stringify({ amountCentavos, notes, categoryId })
      });
      await refresh();
    },
    [refresh]
  );

  return { sharedAccounts, isLoading, isBackendPending, error, refresh, createAccount, deposit, recordExpense };
}
