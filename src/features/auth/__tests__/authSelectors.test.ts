import { describe, expect, it } from 'vitest';
import { createTestStore } from '../../../test/createTestStore';
import { sessionLoaded } from '../authSlice';
import { selectCurrentUser, selectIsAuthenticated, selectUserId } from '../authSelectors';

describe('authSelectors', () => {
  it('reflects an unauthenticated session by default', () => {
    const store = createTestStore();
    expect(selectIsAuthenticated(store.getState())).toBe(false);
    expect(selectCurrentUser(store.getState())).toBeNull();
    expect(selectUserId(store.getState())).toBeNull();
  });

  it('reflects the authenticated session', () => {
    const store = createTestStore();
    store.dispatch(sessionLoaded({ id: 'u1', email: 'a@b.c', name: 'A', currency: 'PHP' }));
    expect(selectIsAuthenticated(store.getState())).toBe(true);
    expect(selectUserId(store.getState())).toBe('u1');
  });
});
