import React, { useState, useEffect, useCallback } from 'react';
import {
  GlobalQuoteData,
  StockOverviewData,
  DailyPricePoint,
  TopMoversResponse,
  NewsSentimentItem,
  StockPrediction
} from '../types/stocks';
import {
  fetchGlobalQuote,
  fetchStockOverview,
  fetchDailyTimeSeries,
  fetchNewsSentiment,
  fetchTopMovers,
  getWatchlist,
  toggleWatchlistSymbol
} from '../services/stocksApi';
import { generateStockPrediction } from '../features/stocks/stockPredictionEngine';
import { WatchlistBar } from '../features/stocks/components/WatchlistBar';
import { StockQuoteCard } from '../features/stocks/components/StockQuoteCard';
import { StockChartCard } from '../features/stocks/components/StockChartCard';
import { StockPredictionCard } from '../features/stocks/components/StockPredictionCard';
import { StockSentimentCard } from '../features/stocks/components/StockSentimentCard';
import { TopMoversCard } from '../features/stocks/components/TopMoversCard';
import { TrendingUp, Radio, AlertCircle } from 'lucide-react';

export const StocksView: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [quote, setQuote] = useState<GlobalQuoteData | null>(null);
  const [overview, setOverview] = useState<StockOverviewData | null>(null);
  const [history, setHistory] = useState<DailyPricePoint[]>([]);
  const [news, setNews] = useState<NewsSentimentItem[]>([]);
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [movers, setMovers] = useState<TopMoversResponse | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(() => getWatchlist());
  const [isLoadingStock, setIsLoadingStock] = useState<boolean>(true);
  const [isLoadingMovers, setIsLoadingMovers] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Load Movers on mount
  useEffect(() => {
    let isMounted = true;
    async function loadMovers() {
      setIsLoadingMovers(true);
      try {
        const data = await fetchTopMovers();
        if (isMounted) setMovers(data);
      } catch (err) {
        console.error('Failed to load movers:', err);
      } finally {
        if (isMounted) setIsLoadingMovers(false);
      }
    }
    loadMovers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load stock details & prediction
  const loadStockData = useCallback(async (symbol: string) => {
    setIsLoadingStock(true);
    setErrorNotice(null);

    try {
      // Parallel fetch with individual error handling
      const [quoteRes, overviewRes, historyRes, newsRes] = await Promise.allSettled([
        fetchGlobalQuote(symbol),
        fetchStockOverview(symbol),
        fetchDailyTimeSeries(symbol),
        fetchNewsSentiment(symbol)
      ]);

      const q = quoteRes.status === 'fulfilled' ? quoteRes.value : null;
      const ov = overviewRes.status === 'fulfilled' ? overviewRes.value : null;
      const hist = historyRes.status === 'fulfilled' ? historyRes.value : [];
      const n = newsRes.status === 'fulfilled' ? newsRes.value : [];

      if (!q) {
        throw new Error(`Failed to load quote for ${symbol}`);
      }

      setQuote(q);
      setOverview(ov);
      setHistory(hist);
      setNews(n);

      // Compute multi-factor quantitative prediction
      const pred = generateStockPrediction(q, ov, hist, n);
      setPrediction(pred);
    } catch (err: any) {
      console.error('Error loading stock data:', err);
      setErrorNotice(`Unable to load real-time telemetry for ${symbol}. Showing cached data.`);
    } finally {
      setIsLoadingStock(false);
    }
  }, []);

  useEffect(() => {
    loadStockData(selectedSymbol);
  }, [selectedSymbol, loadStockData]);

  // Watchlist handlers
  const handleToggleWatchlist = () => {
    const updated = toggleWatchlistSymbol(selectedSymbol);
    setWatchlist(updated);
  };

  const handleRemoveWatchlist = (sym: string) => {
    const updated = toggleWatchlistSymbol(sym);
    setWatchlist(updated);
  };

  const isWatchlisted = watchlist.includes(selectedSymbol.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-light-border dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-light-text dark:text-dark-text tracking-tight">
              US Stocks Monitoring & Prediction
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-light-textMuted dark:text-dark-textMuted mt-0.5">
            Real-time market analytics, Wall Street price targets, and multi-factor quantitative forecasts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Alpha Vantage Connected</span>
          </div>
        </div>
      </div>

      {/* Error notice banner */}
      {errorNotice && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Search & Watchlist Bar */}
      <WatchlistBar
        selectedSymbol={selectedSymbol}
        watchlist={watchlist}
        onSelectSymbol={(sym) => setSelectedSymbol(sym)}
        onRemoveWatchlist={handleRemoveWatchlist}
      />

      {/* Main Grid: Content Area & Movers Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Stock Details, Chart, Prediction, News */}
        <div className="lg:col-span-2 space-y-6">
          {quote && (
            <StockQuoteCard
              quote={quote}
              overview={overview}
              isWatchlisted={isWatchlisted}
              onToggleWatchlist={handleToggleWatchlist}
              onRefresh={() => loadStockData(selectedSymbol)}
              isLoading={isLoadingStock}
            />
          )}

          <StockChartCard
            history={history}
            prediction={prediction}
            symbol={selectedSymbol}
            isLoading={isLoadingStock}
          />

          <StockPredictionCard
            prediction={prediction}
            isLoading={isLoadingStock}
          />

          <StockSentimentCard
            news={news}
            symbol={selectedSymbol}
            isLoading={isLoadingStock}
          />
        </div>

        {/* Right 1 Column: Top Movers & Market Overview */}
        <div className="space-y-6">
          <TopMoversCard
            movers={movers}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={(sym) => setSelectedSymbol(sym)}
            isLoading={isLoadingMovers}
          />

          {/* Educational Quick Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent border border-violet-500/20 text-xs space-y-2.5">
            <h4 className="font-bold text-sm text-light-text dark:text-dark-text flex items-center gap-1.5">
              <span>💡</span> About the Prediction Model
            </h4>
            <p className="text-light-textMuted dark:text-dark-textMuted leading-relaxed">
              Our multi-factor quantitative prediction engine blends Wall Street analyst consensus, 50-day and 200-day moving average trendlines, least-squares linear momentum, and real-time financial news sentiment to calculate objective price targets and probability bands.
            </p>
            <div className="pt-2 border-t border-violet-500/15 flex items-center justify-between text-[11px] text-light-textMuted dark:text-dark-textMuted">
              <span>Data source: Alpha Vantage API</span>
              <span className="font-semibold text-violet-600 dark:text-violet-400">USD Equities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
