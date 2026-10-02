import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Wallet,
  Users,
  Calendar as CalendarIcon,
  Repeat,
  Target,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogIn,
  User,
  Sparkles,
  Zap,
  Lock,
  Cloud,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../shared/components/ui';

export interface LandingPageViewProps {
  onChooseGuest: () => void;
  onOpenAuth: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onChooseGuest,
  onOpenAuth
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text flex flex-col selection:bg-dark-primary selection:text-white">
      {/* 1. TOP DOWNLOAD BANNER */}
      {showBanner && (
        <div className="relative bg-gradient-to-r from-dark-primary via-dark-primaryDark to-indigo-700 text-white px-4 py-2.5 sm:px-6 shadow-md z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Smartphone className="w-4 h-4 shrink-0 text-dark-primaryLight" />
              <span className="truncate">
                <strong className="font-semibold">MoneySaver Android App:</strong> Production APK (v1.0.0, 90 MB) is ready for direct installation!
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/moneysaver.apk"
                download="MoneySaver.apk"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-dark-primaryDark font-bold rounded-full text-xs shadow-sm hover:bg-slate-100 transition-transform active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK</span>
              </a>
              <button
                onClick={() => setShowBanner(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HEADER */}
      <header className="sticky top-0 z-40 bg-light-background/85 dark:bg-dark-background/85 backdrop-blur-md border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dark-primary flex items-center justify-center text-white shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-dark-primary to-dark-primaryDark bg-clip-text text-transparent">
                MoneySaver
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-dark-primary/10 text-dark-primary">
                v1.0.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-light-border dark:border-dark-border text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
              title="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <button
              onClick={onChooseGuest}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
            >
              Guest Mode
            </button>

            <Button size="sm" variant="primary" onClick={onOpenAuth}>
              <LogIn className="w-4 h-4 mr-1.5" />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-light-border dark:border-dark-border">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-dark-primary/10 dark:bg-dark-primary/15 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-primary/10 text-dark-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Offline-First Personal & Shared Finance
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            Master your cashflow.{' '}
            <span className="bg-gradient-to-r from-dark-primary to-indigo-500 bg-clip-text text-transparent">
              Grow together.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-light-textSecondary dark:text-dark-textSecondary max-w-2xl mx-auto leading-relaxed">
            MoneySaver is a modern, privacy-focused financial companion designed for solo savers and couples.
            Track multiple accounts, manage recurring bills, set shared goals, and stay in sync across Web and Android — even when completely offline.
          </p>

          {/* === THE ENTRY GATE (CHOOSE GUEST OR LOGIN) === */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* OPTION 1: GUEST */}
            <div
              onClick={onChooseGuest}
              className="group text-left p-6 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/60 border-2 border-transparent hover:border-dark-primary/50 transition-all cursor-pointer shadow-subtle dark:shadow-subtle-dark hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-light-card dark:bg-dark-card flex items-center justify-center text-dark-primary mb-4 group-hover:bg-dark-primary group-hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-light-text dark:text-dark-text flex items-center justify-between">
                <span>Continue as Guest</span>
                <ChevronRight className="w-4 h-4 text-light-textMuted group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="mt-1 text-xs text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                Test and use all features instantly in local browser storage. No account, email, or password required.
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center text-xs font-semibold text-dark-primary">
                  Launch Guest Dashboard &rarr;
                </span>
              </div>
            </div>

            {/* OPTION 2: CLOUD ACCOUNT */}
            <div
              onClick={onOpenAuth}
              className="group text-left p-6 rounded-2xl bg-dark-primary/10 border-2 border-dark-primary/30 hover:border-dark-primary transition-all cursor-pointer shadow-subtle dark:shadow-subtle-dark hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-dark-primary flex items-center justify-center text-white mb-4">
                <LogIn className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-light-text dark:text-dark-text flex items-center justify-between">
                <span>Sign In or Register</span>
                <ChevronRight className="w-4 h-4 text-dark-primary group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="mt-1 text-xs text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                Unlock cloud backup, cross-device sync with Android APK, and invite a partner for shared goals.
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center text-xs font-semibold text-dark-primary">
                  Connect Cloud Account &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Quick APK CTA Link */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-light-textMuted dark:text-dark-textMuted">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Looking for the mobile app?</span>
            <a
              href="/moneysaver.apk"
              download="MoneySaver.apk"
              className="text-dark-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              Download Android APK (90 MB)
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. CORE TOPICS & CAPABILITIES */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Designed for Real Financial Clarity
          </h2>
          <p className="mt-3 text-sm sm:text-base text-light-textSecondary dark:text-dark-textSecondary">
            Everything you need to stop guessing where your money goes each month.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-xl bg-dark-primary/10 text-dark-primary flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Multi-Account Ledger</h3>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
              Consolidate Cash, Payroll, Savings, E-wallets, and Cards in one place. Account balances compute dynamically from true transactions so your numbers always reconcile.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Partner & Shared Goals</h3>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
              Link with your partner using a private 6-digit code. Fund shared targets like vacations, house downpayments, or emergency funds with mutual visibility and split accounts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Calendar & Day Notes</h3>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
              View your financial activity on a calendar grid. Attach freeform daily financial notes to capture thoughts, reminders, or receipt details for any date.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Recurring Bills & Subscriptions</h3>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
              Track periodic subscriptions, rent, and utility bills. Mark occurrences as paid or skip them with a single click without messing up historical balance projections.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Offline-First Engine</h3>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
              Your finances never lock up due to spotty WiFi. Changes queue locally and push to MongoDB Atlas automatically as soon as an internet connection is established.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Private & Data Wipe Safety</h3>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
              You own your data. When you log out on Android or web, you can choose to completely wipe all cached local database records from the device with zero trace.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ANDROID APK DOWNLOAD SPOTLIGHT */}
      <section className="py-14 bg-gradient-to-b from-light-surface/30 to-light-surface/70 dark:from-dark-surface/30 dark:to-dark-surface/70 border-y border-light-border dark:border-dark-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-light-card/80 dark:bg-dark-card/80 border border-light-border dark:border-dark-border shadow-xl flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Smartphone className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Standalone APK
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                Install MoneySaver on Android
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                Enjoy lightning-fast SQLite local storage, native adaptive icons, seamless biometrics, and offline data sync directly on your Android phone.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-light-textMuted dark:text-dark-textMuted">
                <span>• File: <code>moneysaver.apk</code></span>
                <span>• Size: <strong>~90 MB</strong></span>
                <span>• Android 8.0+ supported</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-2">
              <a
                href="/moneysaver.apk"
                download="MoneySaver.apk"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm active:scale-95"
              >
                <Download className="w-5 h-5" />
                <span>Download APK</span>
              </a>
              <span className="text-[11px] text-light-textMuted dark:text-dark-textMuted">
                Direct safe download
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION & FOOTER */}
      <footer className="mt-auto py-12 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-dark-primary flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-light-text dark:text-dark-text">
              MoneySaver Personal Finance
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-light-textSecondary dark:text-dark-textSecondary">
            <button onClick={onChooseGuest} className="hover:text-dark-primary transition-colors">
              Guest Mode
            </button>
            <span>•</span>
            <button onClick={onOpenAuth} className="hover:text-dark-primary transition-colors">
              Sign In
            </button>
            <span>•</span>
            <a href="/moneysaver.apk" download="MoneySaver.apk" className="text-emerald-500 font-semibold hover:underline">
              Download APK
            </a>
          </div>

          <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
            &copy; {new Date().getFullYear()} MoneySaver. Offline-first & cloud synced.
          </p>
        </div>
      </footer>
    </div>
  );
};
