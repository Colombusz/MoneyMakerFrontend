export type ThemePreference = 'light' | 'dark' | 'system';

/** Small client-only settings (persisted to localStorage by a listener, not tokens). */
export interface SettingsState {
  theme: ThemePreference;
  currency: string;
}
