import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { apiClient, normalizeError } from '../shared/services/apiClient';

/** Arguments our base query accepts (mirrors the single API client's shape). */
export interface ApiRequestArgs {
  url: string;
  method?: string;
  body?: unknown;
}

export interface ApiBaseQueryError {
  status: 'CUSTOM_ERROR';
  error: string;
}

/**
 * The base query wraps the single API client module (auth header, single-flight
 * 401 refresh, error normalization) instead of talking to `fetch` directly.
 */
const baseQuery: BaseQueryFn<ApiRequestArgs, unknown, ApiBaseQueryError> = async (args) => {
  try {
    const data = await apiClient<unknown>(args.url, {
      method: args.method ?? 'GET',
      body: args.body === undefined ? undefined : JSON.stringify(args.body),
    });
    return { data };
  } catch (error) {
    return { error: { status: 'CUSTOM_ERROR', error: normalizeError(error) } };
  }
};

/**
 * The single base API slice. Feature endpoints are injected with
 * `injectEndpoints` in each feature folder; tags drive automated re-fetching.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Account',
    'Category',
    'Transaction',
    'MonthSummary',
    'Goal',
    'SharedGoal',
    'Partner',
    'RecurringRule',
    'RecurringOccurrence'
  ],
  endpoints: () => ({})
});
