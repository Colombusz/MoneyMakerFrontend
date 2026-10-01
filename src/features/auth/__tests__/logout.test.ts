import { describe, expect, it } from 'vitest';
import { createTestStore } from '../../../test/createTestStore';
import { sessionLoaded } from '../authSlice';
import { logout } from '../logout';
import { selectMonth } from '../../ui/uiSlice';
import { setCurrency } from '../../settings/settingsSlice';

describe('logout', () => {
  it('resets every slice to its initial state', () => {
    const store = createTestStore();
    store.dispatch(sessionLoaded({ id: 'u1', email: 'a@b.c', name: 'A', currency: 'PHP' }));
    store.dispatch(selectMonth('2020-01'));
    store.dispatch(setCurrency('USD'));

    store.dispatch(logout());

    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.status).toBe('loading');
    expect(state.ui.selectedMonth).not.toBe('2020-01');
    expect(state.settings.currency).toBe('PHP');
  });

  it('clears the RTK Query cache', () => {
    const store = createTestStore();
    store.dispatch(logout());
    expect(store.getState().api.queries).toEqual({});
    expect(store.getState().api.mutations).toEqual({});
  });
});
