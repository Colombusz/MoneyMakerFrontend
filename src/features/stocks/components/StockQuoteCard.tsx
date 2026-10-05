import React from 'react';
import { GlobalQuoteData, StockOverviewData } from '../../../types/stocks';
import { Star, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockQuoteCardProps {
  quote: GlobalQuoteData;
  overview: StockOverviewData | null;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const StockQuoteCard: React.FC<StockQuoteCardProps> = ({
  quote,
  overview,
  isWatchlisted,
  onToggleWatchlist,
  onRefresh,
  isLoading
}) => {
  const isPositive = quote.change >= 0;

  // Day Range percentage
  const dayRangeSpan = Math.max(0.01, quote.high - quote.low);
  const dayPosition = Math.min(100, Math.max(0, ((quote.price - quote.low) / dayRangeSpan) * 100));

  // 52-Week Range percentage
  const high52 = overview?.week52High || quote.high * 1.1;
  const low52 = overview?.week52Low || quote.low * 0.8;
  const span52 = Math.max(0.01, high52 - low52);
  const position52 = Math.min(100, Math.max(0, ((quote.price - low52) / span52) * 100));

  // Market Cap formatting
  const formatMarketCap = (val?: number) => {
    if (!val || val === 0) return 'N/A';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border dark:border-dark-border shadow-sm">
      {/* Header Symbol, Name, Badges & Actions */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-black text-light-text dark:text-dark-text tracking-tight">
              {quote.symbol}
            </h2>
            {overview?.exchange && (
              <span className="px-2 py-0.5 rounded-md bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border text-[11px] font-semibold text-light-textMuted dark:text-dark-textMuted uppercase">
                {overview.exchange}
              </span>
            )}
            {overview?.sector && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                {overview.sector}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted mt-0.5 line-clamp-1">
            {overview?.name || 'US Equity Asset'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleWatchlist}
            className={`p-2 rounded-xl border transition-all ${
              isWatchlisted
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                : 'bg-light-background dark:bg-dark-background border-light-border dark:border-dark-border text-light-textMuted dark:text-dark-textMuted hover:text-amber-500'
            }`}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-500' : ''}`} />
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text transition-all disabled:opacity-50"
            title="Refresh Stock Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Big Price & Change Banner */}
      <div className="flex items-baseline gap-3 mb-5 flex-wrap">
        <span className="text-3xl sm:text-4xl font-black text-light-text dark:text-dark-text">
          ${quote.price.toFixed(2)}
        </span>
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-sm font-bold border ${
            isPositive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>
            {isPositive ? '+' : ''}
            {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
            {quote.changePercentNum.toFixed(2)}%)
          </span>
        </div>
        <span className="text-xs text-light-textMuted dark:text-dark-textMuted ml-auto">
          Trading Day: {quote.latestTradingDay}
        </span>
      </div>

      {/* Ranges Bar (Day Range & 52-Week Range) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 pb-4 border-t border-b border-light-border dark:border-dark-border mb-4">
        {/* Day Range */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-light-textMuted dark:text-dark-textMuted mb-1.5">
            <span>Day Range</span>
            <span>
              ${quote.low.toFixed(2)} - ${quote.high.toFixed(2)}
            </span>
          </div>
          <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-emerald-500 rounded-full"
              style={{ width: `${dayPosition}%` }}
            />
          </div>
        </div>

        {/* 52-Week Range */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-light-textMuted dark:text-dark-textMuted mb-1.5">
            <span>52-Week Range</span>
            <span>
              ${low52.toFixed(2)} - ${high52.toFixed(2)}
            </span>
          </div>
          <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-blue-500 rounded-full"
              style={{ width: `${position52}%` }}
            />
          </div>
        </div>
      </div>

      {/* Fundamental Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
          <div className="text-light-textMuted dark:text-dark-textMuted">Market Cap</div>
          <div className="font-bold text-light-text dark:text-dark-text text-sm mt-0.5">
            {formatMarketCap(overview?.marketCapitalization)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
          <div className="text-light-textMuted dark:text-dark-textMuted">P/E Ratio</div>
          <div className="font-bold text-light-text dark:text-dark-text text-sm mt-0.5">
            {overview?.peRatio ? `${overview.peRatio.toFixed(1)}x` : 'N/A'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
          <div className="text-light-textMuted dark:text-dark-textMuted">EPS (TTM)</div>
          <div className="font-bold text-light-text dark:text-dark-text text-sm mt-0.5">
            {overview?.eps ? `$${overview.eps.toFixed(2)}` : 'N/A'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
          <div className="text-light-textMuted dark:text-dark-textMuted">Div Yield</div>
          <div className="font-bold text-light-text dark:text-dark-text text-sm mt-0.5">
            {overview?.dividendYield ? `${(overview.dividendYield * 100).toFixed(2)}%` : '0.00%'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
          <div className="text-light-textMuted dark:text-dark-textMuted">Volume</div>
          <div className="font-bold text-light-text dark:text-dark-text text-sm mt-0.5">
            {(quote.volume / 1e6).toFixed(2)}M
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
          <div className="text-light-textMuted dark:text-dark-textMuted">50D / 200D MA</div>
          <div className="font-bold text-light-text dark:text-dark-text text-sm mt-0.5">
            ${overview?.movingAverage50 ? overview.movingAverage50.toFixed(0) : '—'} / $
            {overview?.movingAverage200 ? overview.movingAverage200.toFixed(0) : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
