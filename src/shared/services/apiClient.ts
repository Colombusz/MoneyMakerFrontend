/**
 * Base URL of the MoneyMakerBackend REST API.
 *
 * **Dev mode**: empty string → all requests go to relative paths like
 * `/api/auth/login`, which the Vite proxy (configured in `vite.config.ts`)
 * forwards to the backend. No CORS issues, no hardcoded ports.
 *
 * **Production**: reads `VITE_API_URL` from `.env` (baked into the bundle at
 * build time). Falls back to `''` (same-origin) if unset.
 *
 * Only `VITE_`-prefixed vars are exposed to the browser bundle.
 * Restart the dev server after editing `.env`.
 */
const readApiBaseUrl = (): string => {
  // In dev, always use relative URLs so the Vite proxy handles routing.
  // The proxy target is configured once in vite.config.ts (reads VITE_API_URL).
  if (import.meta.env.DEV) {
    return '';
  }

  // Production: use the env var, or fall back to same-origin.
  const configured = import.meta.env.VITE_API_URL;
  const value = typeof configured === 'string' ? configured.trim() : '';
  return value.replace(/\/+$/, '');
};

export const API_BASE_URL = readApiBaseUrl();

const ACCESS_TOKEN_KEY = 'moneysaver_web_access_token';
const REFRESH_TOKEN_KEY = 'moneysaver_web_refresh_token';

export const getStoredAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getStoredRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setStoredTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearStoredTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

export const normalizeError = (
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred'
): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return String((error as { error: unknown }).error);
  }
  return fallbackMessage;
};

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth) {
    const token = getStoredAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (_err) {
    throw new Error('Unable to connect to server. Check your network connection.');
  }

  const isAuthEndpointThatCannotRefresh =
    endpoint.includes('/auth/login') ||
    endpoint.includes('/auth/register') ||
    endpoint.includes('/auth/refresh');

  if (response.status === 401 && !options.skipAuth && !isAuthEndpointThatCannotRefresh) {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setStoredTokens(data.accessToken, data.refreshToken);

          headers.set('Authorization', `Bearer ${data.accessToken}`);
          const retryRes = await fetch(url, { ...options, headers });
          if (!retryRes.ok) {
            const err = await retryRes.json().catch(() => ({}));
            throw new Error(err.error || `Error ${retryRes.status}`);
          }
          return (await retryRes.json()) as T;
        } else if (refreshResponse.status === 401 || refreshResponse.status === 403) {
          clearStoredTokens();
          throw new Error('Session expired, please log in again.');
        } else {
          // Temporary server error on refresh, do not clear tokens
          throw new Error('Authentication server temporarily unavailable.');
        }
      } catch (e: any) {
        if (e?.message === 'Session expired, please log in again.') {
          throw e;
        }
        // Network error during refresh, do not revoke tokens
        throw e;
      }
    }
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const apiFetch = apiClient;
