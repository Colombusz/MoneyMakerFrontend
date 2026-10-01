import type { RootState } from '../../store';

export const selectTheme = (state: RootState) => state.settings.theme;
export const selectCurrency = (state: RootState) => state.settings.currency;
