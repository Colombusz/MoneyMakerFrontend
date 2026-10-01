import { afterEach, describe, expect, it, vi } from 'vitest';

const loadApiBaseUrl = async (envOverrides: Record<string, string> = {}): Promise<string> => {
  for (const [key, val] of Object.entries(envOverrides)) {
    vi.stubEnv(key, val);
  }
  vi.resetModules();
  const mod = await import('../apiClient');
  return mod.API_BASE_URL;
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('API_BASE_URL', () => {
  it('returns empty string in dev mode (uses Vite proxy)', async () => {
    // Vitest runs with DEV=true by default, so API_BASE_URL should be ''
    await expect(loadApiBaseUrl()).resolves.toBe('');
  });

  it('returns empty string in dev mode even when VITE_API_URL is set', async () => {
    await expect(
      loadApiBaseUrl({ VITE_API_URL: 'https://api.moneysaver.dev' })
    ).resolves.toBe('');
  });

  it('uses VITE_API_URL in production mode', async () => {
    await expect(
      loadApiBaseUrl({ DEV: '', VITE_API_URL: 'https://api.moneysaver.dev' })
    ).resolves.toBe('https://api.moneysaver.dev');
  });

  it('trims whitespace and strips trailing slashes in production', async () => {
    await expect(
      loadApiBaseUrl({ DEV: '', VITE_API_URL: '  http://localhost:4000/  ' })
    ).resolves.toBe('http://localhost:4000');
  });

  it('falls back to same-origin (empty string) in production when VITE_API_URL is blank', async () => {
    await expect(
      loadApiBaseUrl({ DEV: '', VITE_API_URL: '' })
    ).resolves.toBe('');
  });
});
