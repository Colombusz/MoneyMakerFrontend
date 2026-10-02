import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Repeat,
  Target,
  Users,
  Plus,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Wallet,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IconButton, Pill } from '../shared/components/ui';

export type NavTab = 'dashboard' | 'calendar' | 'recurring' | 'goals' | 'partner';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAddTransaction: () => void;
  onOpenAuth: () => void;
  onOpenLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddTransaction,
  onOpenAuth,
  onOpenLanding
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: CalendarIcon },
    { id: 'recurring' as NavTab, label: 'Recurring', icon: Repeat },
    { id: 'goals' as NavTab, label: 'Goals', icon: Target },
    { id: 'partner' as NavTab, label: 'Partner', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-30 bg-light-background/90 dark:bg-dark-background/90 backdrop-blur-md border-b border-light-border dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-dark-primary flex items-center justify-center text-white shadow-sm">
              <Wallet className="w-4.5 h-4.5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold bg-gradient-to-r from-dark-primary to-dark-primaryDark bg-clip-text text-transparent">
                MoneyMaker
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (>=1024px) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-dark-primary dark:bg-dark-primary text-white font-semibold'
                      : 'text-light-textSecondary dark:text-dark-textSecondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Direct APK Download in Navbar */}
            <a
              href="/moneymaker.apk"
              download="MoneyMaker.apk"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all"
              title="Download Android APK (90 MB)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get APK</span>
            </a>

            {/* About / Landing Page toggle */}
            {onOpenLanding && (
              <button
                onClick={onOpenLanding}
                className="hidden md:inline-flex items-center px-2.5 py-1.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary transition-all"
                title="View Landing Page"
              >
                About
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
            <IconButton
              icon={isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
            />

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-light-textSecondary dark:text-dark-textSecondary hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-h-[40px] min-w-[40px]"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-dark-primary flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[11px] font-medium">
                  Guest
                </span>
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface text-sm font-medium text-light-text dark:text-dark-text transition-all"
                >
                  <LogIn className="w-4 h-4 text-dark-primary" />
                  <span>Log In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
