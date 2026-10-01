import { describe, expect, it } from 'vitest';
import { createTestStore } from '../../test/createTestStore';
import { sessionLoaded } from '../../features/auth/authSlice';

describe('setupStore', () => {
  it('builds an isolated store per call', () => {
    const a = createTestStore();
    const b = createTestStore();
    a.dispatch(sessionLoaded({ id: 'x', email: 'a@b.c', name: 'A', currency: 'PHP' }));
    expect(a.getState().auth.user?.id).toBe('x');
    expect(b.getState().auth.user).toBeNull();
  });

  it('accepts a preloaded state', () => {
    const store = createTestStore({ settings: { theme: 'dark', currency: 'USD' } });
    expect(store.getState().settings.theme).toBe('dark');
    expect(store.getState().settings.currency).toBe('USD');
  });

  it('keeps state serializable', () => {
    const store = createTestStore();
    store.dispatch(sessionLoaded({ id: 'x', email: 'a@b.c', name: 'A', currency: 'PHP' }));
    expect(() => JSON.stringify(store.getState())).not.toThrow();
  });
});
