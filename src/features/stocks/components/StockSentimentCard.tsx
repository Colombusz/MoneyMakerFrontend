import React from 'react';
import { NewsSentimentItem } from '../../../types/stocks';
import { Newspaper, ExternalLink, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface StockSentimentCardProps {
  news: NewsSentimentItem[];
  symbol: string;
  isLoading: boolean;
}

export const StockSentimentCard: React.FC<StockSentimentCardProps> = ({
  news,
  symbol,
  isLoading
}) => {
  if (isLoading && news.length === 0) {
    return (
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border dark:border-dark-border animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const getSentimentPill = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('bullish')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
          <ThumbsUp className="w-3 h-3" /> {label}
        </span>
      );
    }
    if (l.includes('bearish')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[11px] font-semibold border border-rose-500/20">
          <ThumbsDown className="w-3 h-3" /> {label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-400 text-[11px] font-semibold border border-slate-500/20">
        <Minus className="w-3 h-3" /> {label}
      </span>
    );
  };

  const formatDate = (raw: string) => {
    if (!raw || raw.length < 8) return '';
    // Alpha Vantage format: 20261004T151215
    const y = raw.substring(0, 4);
    const m = raw.substring(4, 6);
    const d = raw.substring(6, 8);
    return `${m}/${d}/${y}`;
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border dark:border-dark-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-base text-light-text dark:text-dark-text">
            {symbol} News & Sentiment
          </h3>
        </div>
        <span className="text-xs text-light-textMuted dark:text-dark-textMuted">Alpha Vantage NLP</span>
      </div>

      {news.length === 0 ? (
        <div className="p-4 text-center text-xs text-light-textMuted dark:text-dark-textMuted">
          No recent articles detected for {symbol}.
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-light-textMuted dark:text-dark-textMuted">
                    {item.source} • {formatDate(item.timePublished)}
                  </span>
                  {getSentimentPill(item.tickerSentimentLabel || item.overallSentimentLabel)}
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sm text-light-text dark:text-dark-text hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2 inline-flex items-center gap-1 group"
                >
                  <span>{item.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>

                {item.summary && (
                  <p className="text-xs text-light-textMuted dark:text-dark-textMuted mt-1 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
