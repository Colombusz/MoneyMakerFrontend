import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Reducer } from '@reduxjs/toolkit';

import { api } from './api';
import { listenerMiddleware } from './listenerMiddleware';
import authReducer, { signedOut } from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import settingsReducer from '../features/settings/settingsSlice';

const combinedReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  ui: uiReducer,
  settings: settingsReducer
});

export type RootState = ReturnType<typeof combinedReducer>;
/** Deep-partial state accepted by `setupStore` (derived, since RTK 2 doesn't re-export `PreloadedState`). */
export type AppPreloadedState = Parameters<typeof combinedReducer>[0];

/**
 * Root reducer that returns every slice to its initial state when the user logs
 * out, so one user's data can never appear in the next session.
 */
const rootReducer: Reducer<RootState, any, AppPreloadedState> = (state, action) => {
  if (action.type === signedOut.type) {
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

/** Factory so tests can build an isolated store with an optional preloaded state. */
export const setupStore = (preloadedState?: AppPreloadedState) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(api.middleware),
    devTools: import.meta.env.MODE !== 'production'
  });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

/** The single app-wide store instance. */
export const store = setupStore();

