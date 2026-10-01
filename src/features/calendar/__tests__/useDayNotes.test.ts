import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDayNotes } from '../useDayNotes';
import { DayNote } from '../../../types';

const mockFetch = vi.fn();

vi.mock('../../../services/api', () => ({
  apiFetch: (...args: unknown[]) => mockFetch(...args),
}));

const note = (day: string, text: string): DayNote => ({
  id: `n-${day}`,
  userId: 'u1',
  date: `${day}T00:00:00.000Z`,
  notes: text,
  updatedAt: `${day}T00:00:00.000Z`,
});

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({ notes: [note('2026-10-05', 'Checked brakes')] });
});

describe('useDayNotes stability', () => {
  // Regression: buildNoteMap was recreated every render and used as an effect
  // dependency, so the fetch effect re-ran forever.
  it('keeps buildNoteMap identity stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useDayNotes(true));
    const first = result.current.buildNoteMap;
    rerender();
    expect(result.current.buildNoteMap).toBe(first);
  });

  it('keeps notesMapEquals identity stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useDayNotes(true));
    const first = result.current.notesMapEquals;
    rerender();
    expect(result.current.notesMapEquals).toBe(first);
  });

  it('builds a map keyed by calendar day', async () => {
    const { result } = renderHook(() => useDayNotes(true));
    const map = result.current.buildNoteMap([note('2026-10-05', 'Checked brakes')]);
    expect(map.get('2026-10-05')).toBe('Checked brakes');
  });

  it('treats equal maps as equal regardless of insertion order', () => {
    const { result } = renderHook(() => useDayNotes(true));
    const a = new Map([['2026-10-05', 'a'], ['2026-10-06', 'b']]);
    const b = new Map([['2026-10-06', 'b'], ['2026-10-05', 'a']]);
    expect(result.current.notesMapEquals(a, b)).toBe(true);
  });

  it('detects added, removed and changed notes', () => {
    const { result } = renderHook(() => useDayNotes(true));
    const base = new Map([['2026-10-05', 'a']]);
    expect(result.current.notesMapEquals(base, new Map([['2026-10-05', 'a'], ['2026-10-06', 'b']]))).toBe(false);
    expect(result.current.notesMapEquals(base, new Map())).toBe(false);
    expect(result.current.notesMapEquals(base, new Map([['2026-10-05', 'changed']]))).toBe(false);
  });

  it('loads notes for the requested month', async () => {
    const { result } = renderHook(() => useDayNotes(true));
    let notes: DayNote[] = [];
    await act(async () => {
      notes = await result.current.fetchDayNotes('2026-10');
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/day-notes?start=2026-10-01&end=2026-10-31');
    expect(result.current.buildNoteMap(notes).get('2026-10-05')).toBe('Checked brakes');
  });

  it('computes the correct end date for a short month', async () => {
    const { result } = renderHook(() => useDayNotes(true));
    await act(async () => {
      await result.current.fetchDayNotes('2026-02');
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/day-notes?start=2026-02-01&end=2026-02-28');
  });

  it('surfaces a load failure instead of silently returning empty', async () => {
    mockFetch.mockRejectedValue(new Error('Request failed with status 404'));
    const { result } = renderHook(() => useDayNotes(true));

    await act(async () => {
      await result.current.fetchDayNotes('2026-10');
    });

    // Previously this was indistinguishable from "you have no notes".
    await waitFor(() => expect(result.current.error).toContain('404'));
  });

  it('clears a previous error on a successful load', async () => {
    mockFetch.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useDayNotes(true));

    await act(async () => {
      await result.current.fetchDayNotes('2026-10');
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.fetchDayNotes('2026-10');
    });
    expect(result.current.error).toBeNull();
  });

  it('does not call the API when signed out', async () => {
    const { result } = renderHook(() => useDayNotes(false));
    await act(async () => {
      expect(await result.current.fetchDayNotes('2026-10')).toEqual([]);
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
