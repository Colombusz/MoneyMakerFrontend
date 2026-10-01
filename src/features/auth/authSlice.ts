import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile } from '../../types';
import type { AuthState } from './types';

const initialState: AuthState = {
  user: null,
  status: 'loading'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionLoaded(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
    },
    signedOut() {
      return initialState;
    }
  }
});

export const { sessionLoaded, signedOut } = authSlice.actions;
export default authSlice.reducer;
