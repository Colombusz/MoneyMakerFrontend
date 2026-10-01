import type { UserProfile } from '../../types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** Client-only auth session. Tokens are NEVER stored here. */
export interface AuthState {
  user: UserProfile | null;
  status: AuthStatus;
}
