import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Repeat,
  Target,
  Users,
  Plus,
  Palmtree
} from 'lucide-react';
import { NavTab } from './Navbar';

interface BottomTabBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAddTransaction: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddTransaction
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: CalendarIcon },
    { id: 'add' as const, label: 'Add', icon: Plus, isAction: true },
    { id: 'goals' as NavTab, label: 'Goals', icon: Target },
    { id: 'partner' as NavTab, label: 'Partner', icon: Users },
    { id: 'vacation' as NavTab, label: 'Vacation', icon: Palmtree }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-light-background/95 dark:bg-dark-background/95 backdrop-blur-md border-t border-light-border dark:border-dark-border pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          if ('isAction' in tab && tab.isAction) {
            return (
              <button
                key="action-add"
                onClick={onOpenAddTransaction}
                className="relative -top-3 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-dark-primary active:bg-dark-primaryDark text-white shadow-lg shadow-dark-primary/30 active:scale-95 transition-transform"
                style={{ minWidth: '48px', minHeight: '48px' }}
                aria-label="Add transaction"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center flex-1 py-1 h-full min-h-[44px] transition-colors ${
                isActive
                  ? 'text-dark-primary dark:text-dark-primary font-semibold'
                  : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
