import React, { useState, useMemo } from 'react';
import { DailyPricePoint, StockPrediction } from '../../../types/stocks';
import { LineChart as ChartIcon, Sparkles } from 'lucide-react';

interface StockChartCardProps {
  history: DailyPricePoint[];
  prediction: StockPrediction | null;
  symbol: string;
  isLoading: boolean;
}

export const StockChartCard: React.FC<StockChartCardProps> = ({
  history,
  prediction,
  symbol,
  isLoading
}) => {
  const [timeframe, setTimeframe] = useState<'7D' | '1M' | '3M'>('1M');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const filteredData = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (timeframe === '7D') return history.slice(-7);
    if (timeframe === '1M') return history.slice(-30);
    return history.slice(-60);
  }, [history, timeframe]);

  // Chart coordinate calculations
  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 24;

  const { points, minPrice, maxPrice, forecastPoints } = useMemo(() => {
    if (filteredData.length === 0) {
      return { points: [], minPrice: 0, maxPrice: 100, forecastPoints: [] };
    }

    const prices = filteredData.map((d) => d.close);
    let min = Math.min(...prices);
    let max = Math.max(...prices);

    // Factor in prediction target if available
    if (prediction) {
      min = Math.min(min, prediction.target7Day.bear);
      max = Math.max(max, prediction.target7Day.bull);
    }

    // Add 4% vertical breathing room
    const span = Math.max(1, max - min);
    min = Math.max(0, min - span * 0.05);
    max = max + span * 0.05;
    const finalSpan = max - min;

    const usableWidth = chartWidth - paddingX * 2;
    const usableHeight = chartHeight - paddingY * 2;

    // Historical points mapping
    const pts = filteredData.map((d, i) => {
      const x = paddingX + (i / Math.max(1, filteredData.length - 1)) * (usableWidth * 0.82);
      const y = chartHeight - paddingY - ((d.close - min) / finalSpan) * usableHeight;
      return { x, y, date: d.date, close: d.close };
    });

    // 7-Day & 30-Day Forecast projection points
    const forecastPts: { x: number; y: number; close: number; label: string }[] = [];
    if (pts.length > 0 && prediction) {
      const lastPt = pts[pts.length - 1];
      forecastPts.push({ x: lastPt.x, y: lastPt.y, close: lastPt.close, label: 'Today' });

      // Projected point 7D
      const x7D = paddingX + usableWidth * 0.92;
      const y7D = chartHeight - paddingY - ((prediction.target7Day.base - min) / finalSpan) * usableHeight;
      forecastPts.push({
        x: x7D,
        y: Math.max(paddingY, Math.min(chartHeight - paddingY, y7D)),
        close: prediction.target7Day.base,
        label: '+7D Forecast'
      });

      // Projected point 30D
      const x30D = paddingX + usableWidth;
      const y30D = chartHeight - paddingY - ((prediction.target30Day.base - min) / finalSpan) * usableHeight;
      forecastPts.push({
        x: x30D,
        y: Math.max(paddingY, Math.min(chartHeight - paddingY, y30D)),
        close: prediction.target30Day.base,
        label: '+30D Forecast'
      });
    }

    return { points: pts, minPrice: min, maxPrice: max, forecastPoints: forecastPts };
  }, [filteredData, prediction, chartWidth, chartHeight, paddingX, paddingY]);

  if (isLoading && points.length === 0) {
    return (
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border dark:border-dark-border animate-pulse h-64 flex items-center justify-center">
        <span className="text-sm text-light-textMuted dark:text-dark-textMuted">Loading chart data...</span>
      </div>
    );
  }

  // Generate SVG path strings
  const historicalPathD = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const areaPathD = points.length > 0
    ? `${historicalPathD} L ${points[points.length - 1].x.toFixed(1)} ${chartHeight - paddingY} L ${points[0].x.toFixed(1)} ${chartHeight - paddingY} Z`
    : '';

  const forecastPathD = forecastPoints.length > 0
    ? forecastPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const isUpwardTrend = points.length >= 2 && points[points.length - 1].close >= points[0].close;
  const strokeColor = isUpwardTrend ? '#10b981' : '#f43f5e';

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border dark:border-dark-border shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-base text-light-text dark:text-dark-text">
            {symbol} Price Trend & Forecast Line
          </h3>
          {prediction && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              <Sparkles className="w-3 h-3" /> Linear Model
            </span>
          )}
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1 bg-light-background dark:bg-dark-background p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          {(['7D', '1M', '3M'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-dark-primary text-white shadow-xs font-bold'
                  : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Hover Info bar */}
      <div className="h-6 flex items-center justify-between text-xs text-light-textMuted dark:text-dark-textMuted mb-2 px-1">
        {activePoint ? (
          <>
            <span className="font-semibold text-light-text dark:text-dark-text">
              Date: {activePoint.date}
            </span>
            <span className="font-black text-sm text-light-text dark:text-dark-text">
              Close: ${activePoint.close.toFixed(2)}
            </span>
          </>
        ) : (
          <span>Hover over chart to inspect historical prices</span>
        )}
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartWidth - paddingX}
            y2={paddingY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={chartHeight / 2}
            x2={chartWidth - paddingX}
            y2={chartHeight / 2}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Price Labels on Right Axis */}
          <text
            x={chartWidth - paddingX + 5}
            y={paddingY + 4}
            fill="currentColor"
            className="text-[10px] text-light-textMuted dark:text-dark-textMuted"
          >
            ${maxPrice.toFixed(0)}
          </text>
          <text
            x={chartWidth - paddingX + 5}
            y={chartHeight - paddingY}
            fill="currentColor"
            className="text-[10px] text-light-textMuted dark:text-dark-textMuted"
          >
            ${minPrice.toFixed(0)}
          </text>

          {/* Area fill */}
          {areaPathD && <path d={areaPathD} fill="url(#chartGradient)" />}

          {/* Historical price line */}
          {historicalPathD && (
            <path
              d={historicalPathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Forecast dotted line */}
          {forecastPathD && (
            <path
              d={forecastPathD}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinecap="round"
            />
          )}

          {/* Forecast target points */}
          {forecastPoints.slice(1).map((fp, idx) => (
            <g key={idx}>
              <circle cx={fp.x} cy={fp.y} r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
              <text
                x={fp.x}
                y={fp.y - 8}
                textAnchor="middle"
                fill="#8b5cf6"
                className="text-[10px] font-bold"
              >
                ${fp.close.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Interactive hover overlay circles */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? '6' : '3'}
              fill={hoverIndex === i ? strokeColor : 'transparent'}
              stroke={hoverIndex === i ? '#ffffff' : 'transparent'}
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}
        </svg>
      </div>

      {/* Chart Footer Legend */}
      <div className="flex items-center justify-between text-xs text-light-textMuted dark:text-dark-textMuted pt-2 border-t border-light-border dark:border-dark-border mt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 rounded-full"
              style={{ backgroundColor: strokeColor }}
            />
            <span>Historical Close</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-violet-500 rounded-full border-t border-dashed" />
            <span className="text-violet-600 dark:text-violet-400 font-medium">
              Model Forecast (+7D, +30D)
            </span>
          </div>
        </div>
        <span className="text-[11px] hidden sm:inline">Daily Interval (US/Eastern)</span>
      </div>
    </div>
  );
};
