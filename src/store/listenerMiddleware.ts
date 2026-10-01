import { createListenerMiddleware } from '@reduxjs/toolkit';

/**
 * The single place for cross-feature side effects. Feature listeners are
 * registered on this instance (in the feature folder) so the store module only
 * has to `.prepend(listenerMiddleware.middleware)`.
 */
export const listenerMiddleware = createListenerMiddleware();
