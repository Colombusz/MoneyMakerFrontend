import React, { useState } from 'react';
import { TopMoversResponse, TopMoverItem } from '../../../types/stocks';
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TopMoversCardProps {
  movers: TopMoversResponse | null;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  isLoading: boolean;
}

export const TopMoversCard: React.FC<TopMoversCardProps> = ({
  movers,
  selectedSymbol,
  onSelectSymbol,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'active'>('gainers');

  if (isLoading && !movers) {
    return (
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border dark:border-dark-border animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const items: TopMoverItem[] =
    activeTab === 'gainers'
      ? movers?.topGainers || []
      : activeTab === 'losers'
      ? movers?.topLosers || []
      : movers?.mostActivelyTraded || [];

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 sm:p-5 border border-light-border dark:border-dark-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-base text-light-text dark:text-dark-text">US Market Movers</h3>
        </div>
        <span className="text-[11px] text-light-textMuted dark:text-dark-textMuted">
          Live Alpha Vantage
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-light-background dark:bg-dark-background rounded-xl mb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('gainers')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'gainers'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Gainers</span>
        </button>
        <button
          onClick={() => setActiveTab('losers')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'losers'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Losers</span>
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'active'
              ? 'bg-blue-500 text-white shadow-xs'
              : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Most Active</span>
        </button>
      </div>

      {/* Movers List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-0.5">
        {items.map((item) => {
          const isPositive = item.changePercentage >= 0;
          const isSelected = selectedSymbol === item.ticker;

          return (
            <button
              key={item.ticker}
              onClick={() => onSelectSymbol(item.ticker)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-950/20 dark:border-emerald-500/40 ring-1 ring-emerald-500/30'
                  : 'bg-light-background/60 dark:bg-dark-background/60 border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-background'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-light-text dark:text-dark-text">
                  {item.ticker}
                </div>
                <div className="text-[11px] text-light-textMuted dark:text-dark-textMuted">
                  Vol: {(item.volume / 1000000).toFixed(1)}M
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-sm text-light-text dark:text-dark-text">
                  ${item.price.toFixed(2)}
                </div>
                <div
                  className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {item.changePercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
