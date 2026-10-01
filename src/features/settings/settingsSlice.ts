import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SettingsState, ThemePreference } from './types';

const initialState: SettingsState = {
  theme: 'system',
  currency: 'PHP'
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    }
  }
});

export const { setTheme, setCurrency } = settingsSlice.actions;
export default settingsSlice.reducer;
