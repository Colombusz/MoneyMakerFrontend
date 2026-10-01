import { describe, expect, it } from 'vitest';
import authReducer, { sessionLoaded, signedOut } from '../authSlice';

const USER = { id: 'u1', email: 'a@b.c', name: 'A', currency: 'PHP' };

describe('authSlice', () => {
  it('starts loading with no user', () => {
    const state = authReducer(undefined, { type: '@@init' });
    expect(state.user).toBeNull();
    expect(state.status).toBe('loading');
  });

  it('marks the session authenticated on sessionLoaded', () => {
    const state = authReducer(undefined, sessionLoaded(USER));
    expect(state.status).toBe('authenticated');
    expect(state.user?.id).toBe('u1');
  });

  it('returns to the initial state on signedOut', () => {
    const loaded = authReducer(undefined, sessionLoaded(USER));
    const out = authReducer(loaded, signedOut());
    expect(out.user).toBeNull();
    expect(out.status).toBe('loading');
  });
});
