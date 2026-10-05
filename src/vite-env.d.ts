/// <reference types="vite/client" />

/**
 * Type-safe access to custom `VITE_*` environment variables.
 *
 * Add new env vars here so `import.meta.env.VITE_XYZ` gets autocomplete and
 * type-checking. Keep this file in sync with `.env.example`.
 */
interface ImportMetaEnv {
  /** Backend API base URL, e.g. `http://localhost:4000` */
  readonly VITE_API_URL: string;
  /** Dev-server port, e.g. `5173` */
  readonly VITE_PORT: string;
  /** Alpha Vantage API Key for US Stocks Monitoring & Prediction */
  readonly VITE_ALPHA_VANTAGE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
