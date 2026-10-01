import { api } from '../../store/api';
import type { AppThunk } from '../../store/hooks';
import { signedOut } from './authSlice';

/**
 * The single logout routine. `signedOut` makes the root reducer return every
 * slice to its initial state, and `resetApiState` clears the whole RTK Query
 * cache so one user's data can never appear in the next session.
 */
export const logout = (): AppThunk => (dispatch) => {
  dispatch(signedOut());
  dispatch(api.util.resetApiState());
};
