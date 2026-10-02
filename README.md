# MoneyMaker &mdash; Web Application

**MoneyMaker** is a modern, privacy-focused, offline-first personal and shared finance platform.

---

## 🌐 Live Web Application & Downloads

* **Web Application:** [https://money-maker-frontend.vercel.app/](https://money-maker-frontend.vercel.app/) *(or `http://localhost:5173` locally)*
* **Landing Page:** Features an interactive overview, live topic breakdown, and entry gate to choose **Continue as Guest** (local browser storage) or **Sign In / Register** (cloud sync).
* **📱 Android APK Download:**
  * **Direct Download Endpoint:** [https://money-maker-frontend.vercel.app/moneymaker.apk](https://money-maker-frontend.vercel.app/moneymaker.apk) *(hosted endpoint: `/moneymaker.apk`)*
  * **Package Details:** Version 1.0.0 &bull; Size: ~90 MB &bull; Standalone direct installation

---

## ✨ Features

* **Landing Page & Entry Gate:** First-time visitors explore features and choose between instant **Guest Mode** (no signup needed) or **Cloud Account** sync.
* **Top Download Banner:** One-click direct download for the standalone Android APK right from the top of the site.
* **Multi-Account Ledger:** Consolidated balances across Cash, Bank accounts, E-wallets, and Credit Cards computed dynamically from transaction history.
* **Partner Co-Budgeting:** Connect with a partner using a private 6-digit invite code to fund shared savings goals with mutual visibility.
* **Financial Calendar & Day Notes:** Interactive calendar grid with income/expense summaries and daily financial notes.
* **Recurring Bills & Utilities:** Scheduled bill reminders with one-click pay or skip actions.
* **Offline-First Resilience:** Instant response with local client state, syncing in the background with the MongoDB Atlas API.

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* npm or pnpm

### Installation

```bash
cd MoneyMakerFrontend
npm install
```

### Environment Configuration
Create a `.env` file in the root of `MoneyMakerFrontend`:

```env
VITE_PORT=5173
VITE_API_URL=<your_backend_api_url>
```

### Development Server

```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
```
Builds the app into `dist/` and bundles `dist/moneymaker.apk` for direct downloading.

### Running Tests

```bash
npm test
```

---

## ☁️ Deployment (Vercel)

The web frontend is deployed on **Vercel** with client-side SPA routing configured in [`vercel.json`](./vercel.json).

* **Live URL:** [https://money-maker-frontend.vercel.app/](https://money-maker-frontend.vercel.app/)
* **Build Settings in Vercel:**
  * **Framework Preset:** Vite
  * **Root Directory:** `MoneyMakerFrontend` *(or project root)*
  * **Build Command:** `npm run build`
  * **Output Directory:** `dist`
  * **Environment Variables:**
    * `VITE_API_URL` = `<your_backend_api_url>`