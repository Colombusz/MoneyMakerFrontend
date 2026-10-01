import { setupStore } from '../store';
import type { AppPreloadedState, AppStore } from '../store';

/** Builds an isolated store for a test, optionally with a preloaded state. */
export const createTestStore = (preloadedState?: AppPreloadedState): AppStore =>
  setupStore(preloadedState);

