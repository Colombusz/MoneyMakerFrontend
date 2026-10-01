import { useCallback, useState } from 'react';
import { apiFetch } from '../../services/api';
import { DayNote } from '../../types';
import { toDayKey } from '../../shared/utils/date';

export function useDayNotes(isAuthenticated: boolean) {
  // A swallowed fetch error is indistinguishable from "you have no notes", which
  // is exactly how a missing backend endpoint ends up looking like data loss.
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the notes for one month window. The calendar owns the month state, so
   * this is called per month rather than caching internally.
   */
  const fetchDayNotes = useCallback(
    async (monthPrefix: string): Promise<DayNote[]> => {
      if (!isAuthenticated) return [];
      try {
        const [year, month] = monthPrefix.split('-').map(Number);
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const start = `${monthPrefix}-01`;
        const end = `${monthPrefix}-${String(lastDay).padStart(2, '0')}`;

        const res = await apiFetch<{ notes: DayNote[] }>(
          `/api/day-notes?start=${start}&end=${end}`
        );
        setError(null);
        return res.notes ?? [];
      } catch (err) {
        console.error('Failed to load day notes:', err);
        setError(err instanceof Error ? err.message : 'Could not load day notes');
        return [];
      }
    },
    [isAuthenticated]
  );

  /** Empty text clears the note server-side, so one save covers both cases. */
  const saveDayNote = useCallback(
    async (dateKey: string, notes: string): Promise<void> => {
      if (!isAuthenticated) return;
      await apiFetch(`/api/day-notes/${dateKey}`, {
        method: 'PUT',
        body: JSON.stringify({ date: dateKey, notes })
      });
    },
    [isAuthenticated]
  );

  // Memoised: this is a dependency of the caller's fetch effect. Without a stable
  // identity the effect re-runs on every render, and because it stores a fresh Map
  // each time that re-render never settles — an infinite request loop.
  const buildNoteMap = useCallback(
    (notes: DayNote[]): Map<string, string> =>
      new Map(notes.map((n) => [toDayKey(n.date), n.notes])),
    []
  );

  /**
   * Compare note maps by content. Callers use this to return the previous state
   * when nothing actually changed, so React bails out of the re-render instead of
   * looping on an equivalent-but-new object.
   */
  const notesMapEquals = useCallback(
    (a: Map<string, string>, b: Map<string, string>): boolean => {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (b.get(key) !== value) return false;
      }
      return true;
    },
    []
  );

  return { error, fetchDayNotes, saveDayNote, buildNoteMap, notesMapEquals };
}