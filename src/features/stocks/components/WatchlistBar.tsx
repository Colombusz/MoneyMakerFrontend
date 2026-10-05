import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, X, Loader2 } from 'lucide-react';
import { SearchMatchItem } from '../../../types/stocks';
import { searchStocks } from '../../../services/stocksApi';

interface WatchlistBarProps {
  selectedSymbol: string;
  watchlist: string[];
  onSelectSymbol: (symbol: string) => void;
  onRemoveWatchlist: (symbol: string) => void;
}

const POPULAR_SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY'];

export const WatchlistBar: React.FC<WatchlistBarProps> = ({
  selectedSymbol,
  watchlist,
  onSelectSymbol,
  onRemoveWatchlist
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMatchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchStocks(query);
        setSearchResults(results);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener for autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    onSelectSymbol(symbol);
    setQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Search Input Bar with Autocomplete Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-light-textMuted dark:text-dark-textMuted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Search US stocks by symbol or company (e.g. AAPL, NVIDIA, Tesla)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text placeholder:text-light-textMuted dark:placeholder:text-dark-textMuted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-xs transition-all"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3.5 w-4 h-4 text-emerald-500 animate-spin" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3.5 text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-light-border dark:divide-dark-border max-h-64 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.symbol}
                onClick={() => handleSelect(item.symbol)}
                className="w-full px-4 py-2.5 text-left hover:bg-light-background dark:hover:bg-dark-background flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-bold text-sm text-light-text dark:text-dark-text mr-2">
                    {item.symbol}
                  </span>
                  <span className="text-xs text-light-textMuted dark:text-dark-textMuted">
                    {item.name}
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border text-light-textMuted dark:text-dark-textMuted">
                  {item.region}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chips: Watchlist & Popular US Equities */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Watchlist Label */}
        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0 px-1">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span>Watchlist:</span>
        </div>

        {/* Watchlist chips */}
        {watchlist.map((sym) => {
          const isSelected = selectedSymbol === sym;
          return (
            <div
              key={`wl-${sym}`}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-amber-500/50'
              }`}
              onClick={() => onSelectSymbol(sym)}
            >
              <span>{sym}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveWatchlist(sym);
                }}
                className="opacity-70 hover:opacity-100 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                title={`Remove ${sym}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <div className="h-4 w-px bg-light-border dark:bg-dark-border mx-1 shrink-0" />

        {/* Popular chips */}
        <span className="text-xs text-light-textMuted dark:text-dark-textMuted font-semibold shrink-0">
          Popular:
        </span>
        {POPULAR_SYMBOLS.map((sym) => {
          const isSelected = selectedSymbol === sym;
          return (
            <button
              key={`pop-${sym}`}
              onClick={() => onSelectSymbol(sym)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                isSelected
                  ? 'bg-dark-primary text-white border-dark-primary shadow-xs'
                  : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text hover:border-emerald-500/30'
              }`}
            >
              {sym}
            </button>
          );
        })}
      </div>
    </div>
  );
};
