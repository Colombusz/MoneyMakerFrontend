import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config — all tunables come from `.env` files so there's a single
 * source of truth you can edit without touching this file:
 *
 *   VITE_PORT     → dev-server port  (default 5173)
 *   VITE_API_URL  → backend base URL (default http://localhost:4000)
 */
export default defineConfig(({ mode }) => {
  // loadEnv reads .env / .env.local / .env.[mode] from the project root.
  const env = loadEnv(mode, process.cwd(), '');

  const port = Number(env.VITE_PORT) || 5173;
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000';

  return {
    plugins: [react()],
    server: {
      port,
      strictPort: true,
      // Bind loopback only: `host: true` exposes the LAN URL and makes the
      // browser's HMR client attempt the websocket on a host that refuses it
      // (the recurring `ws://localhost:5173/?token=... failed` + stale-module
      // `toDayKey` errors). Serve localhost only in dev.
      host: 'localhost',
      // Proxy /api requests to the backend so the browser never talks cross-origin
      // during local development. In production your reverse-proxy does this instead.
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port,
    },
  };
});
