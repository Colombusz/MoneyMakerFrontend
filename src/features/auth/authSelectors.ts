import type { RootState } from '../../store';

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === 'authenticated';
export const selectUserId = (state: RootState) => state.auth.user?.id ?? null;
