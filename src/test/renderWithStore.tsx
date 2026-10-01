import React from 'react';
import { Provider } from 'react-redux';
import type { AppStore } from '../store';
import { createTestStore } from './createTestStore';

/**
 * Wraps a component tree in a Redux Provider backed by a fresh test store.
 * Pair with a renderer (e.g. @testing-library/react).
 */
export const renderWithStore = (ui: React.ReactElement, store: AppStore = createTestStore()) => (
  <Provider store={store}>{ui}</Provider>
);
