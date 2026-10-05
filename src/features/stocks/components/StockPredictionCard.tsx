import React from 'react';
import { StockPrediction } from '../../../types/stocks';
import {
  Sparkles,
  ShieldCheck,
  Target,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award
} from 'lucide-react';

interface StockPredictionCardProps {
  prediction: StockPrediction | null;
  isLoading: boolean;
}

export const StockPredictionCard: React.FC<StockPredictionCardProps> = ({
  prediction,
  isLoading
}) => {
  if (isLoading && !prediction) {
    return (
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-dark-border animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4"></div>
        <div className="space-y-3">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  // Verdict style mapping
  const getVerdictStyle = (v: string) => {
    switch (v) {
      case 'STRONG BUY':
        return {
          bg: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
          gradient: 'from-emerald-600 to-teal-500',
          text: 'Strong Buy'
        };
      case 'BUY':
        return {
          bg: 'bg-green-500/15 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/40',
          gradient: 'from-green-600 to-emerald-500',
          text: 'Moderate Buy'
        };
      case 'HOLD':
        return {
          bg: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40',
          gradient: 'from-amber-500 to-orange-500',
          text: 'Neutral / Hold'
        };
      case 'UNDERPERFORM':
        return {
          bg: 'bg-orange-500/15 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40',
          gradient: 'from-orange-600 to-rose-500',
          text: 'Underperform'
        };
      case 'STRONG SELL':
      default:
        return {
          bg: 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40',
          gradient: 'from-rose-600 to-red-600',
          text: 'Strong Sell'
        };
    }
  };

  const vStyle = getVerdictStyle(prediction.verdict);

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 sm:p-6 border border-light-border dark:border-dark-border shadow-sm">
      {/* Title & AI Indicator */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-light-text dark:text-dark-text flex items-center gap-2">
              Predictive Quantitative Engine
            </h3>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
              Multi-Factor Technical, Consensus & Sentiment Synthesis
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{prediction.confidencePercentage}% Confidence</span>
        </div>
      </div>

      {/* Main Verdict & Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Verdict Badge */}
        <div className={`col-span-1 md:col-span-2 p-5 rounded-2xl border ${vStyle.bg} flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              Quant Model Recommendation
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold">
              <Award className="w-4 h-4" />
              <span>Score: {prediction.overallScore} / 100</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-3xl sm:text-4xl font-black tracking-tight">{prediction.verdict}</div>
          </div>

          <p className="text-xs mt-3 opacity-90 leading-relaxed">
            Composite evaluation derived from 50/200-day moving average crossovers, Wall Street price targets, linear momentum slope, and market news sentiment.
          </p>
        </div>

        {/* Confidence & Score Progress */}
        <div className="p-4 rounded-2xl bg-light-background/70 dark:bg-dark-background/70 border border-light-border dark:border-dark-border flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-light-textMuted dark:text-dark-textMuted mb-1">
              Model Conviction
            </div>
            <div className="text-2xl font-black text-light-text dark:text-dark-text">
              {prediction.confidencePercentage}%
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${prediction.confidencePercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex justify-between text-xs">
            <span className="text-light-textMuted dark:text-dark-textMuted">Trend Alignment</span>
            <span className="font-bold text-light-text dark:text-dark-text">
              {prediction.technicalTrend.status}
            </span>
          </div>
        </div>
      </div>

      {/* Target Price Projections Cards */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          Price Forecast Targets
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 7-Day Target */}
          <div className="p-3.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between text-xs text-light-textMuted dark:text-dark-textMuted mb-1">
              <span>Next 7 Days</span>
              <span
                className={`font-bold ${
                  prediction.target7Day.percentChange >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {prediction.target7Day.percentChange >= 0 ? '+' : ''}
                {prediction.target7Day.percentChange}%
              </span>
            </div>
            <div className="text-xl font-black text-light-text dark:text-dark-text">
              ${prediction.target7Day.base.toFixed(2)}
            </div>
            <div className="text-[11px] text-light-textMuted dark:text-dark-textMuted mt-1">
              Range: ${prediction.target7Day.bear.toFixed(2)} - ${prediction.target7Day.bull.toFixed(2)}
            </div>
          </div>

          {/* 30-Day Target */}
          <div className="p-3.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between text-xs text-light-textMuted dark:text-dark-textMuted mb-1">
              <span>Next 30 Days</span>
              <span
                className={`font-bold ${
                  prediction.target30Day.percentChange >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {prediction.target30Day.percentChange >= 0 ? '+' : ''}
                {prediction.target30Day.percentChange}%
              </span>
            </div>
            <div className="text-xl font-black text-light-text dark:text-dark-text">
              ${prediction.target30Day.base.toFixed(2)}
            </div>
            <div className="text-[11px] text-light-textMuted dark:text-dark-textMuted mt-1">
              Range: ${prediction.target30Day.bear.toFixed(2)} - ${prediction.target30Day.bull.toFixed(2)}
            </div>
          </div>

          {/* 12-Month Analyst Median */}
          <div className="p-3.5 rounded-xl bg-light-background/60 dark:bg-dark-background/60 border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between text-xs text-light-textMuted dark:text-dark-textMuted mb-1">
              <span>Wall St 12M Target</span>
              <span
                className={`font-bold ${
                  prediction.analystConsensus.upsidePercent >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {prediction.analystConsensus.upsidePercent >= 0 ? '+' : ''}
                {prediction.analystConsensus.upsidePercent}%
              </span>
            </div>
            <div className="text-xl font-black text-light-text dark:text-dark-text">
              ${prediction.analystConsensus.targetPrice.toFixed(2)}
            </div>
            <div className="text-[11px] text-light-textMuted dark:text-dark-textMuted mt-1">
              {prediction.analystConsensus.ratingLabel} ({prediction.analystConsensus.buyPercent}% Buys)
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="mb-6 p-4 rounded-xl bg-light-background/40 dark:bg-dark-background/40 border border-light-border dark:border-dark-border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-textMuted mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Factor Signal Distribution
        </h4>

        <div className="space-y-3 text-xs">
          {/* Technical Moving Average */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-light-text dark:text-dark-text">
                Technical Moving Averages (50D / 200D)
              </span>
              <span className="text-light-textMuted dark:text-dark-textMuted">
                {prediction.technicalTrend.status} ({prediction.technicalTrend.score}/100)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  prediction.technicalTrend.score >= 60 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${prediction.technicalTrend.score}%` }}
              />
            </div>
          </div>

          {/* Linear Momentum */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-light-text dark:text-dark-text">
                Linear Momentum Trajectory
              </span>
              <span className="text-light-textMuted dark:text-dark-textMuted">
                {prediction.linearRegressionTrend.direction} ({prediction.linearRegressionTrend.slopePerDay >= 0 ? '+' : ''}
                ${prediction.linearRegressionTrend.slopePerDay}/day)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${prediction.linearRegressionTrend.score}%` }}
              />
            </div>
          </div>

          {/* Wall Street Consensus */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-light-text dark:text-dark-text">
                Wall Street Analyst Ratings
              </span>
              <span className="text-light-textMuted dark:text-dark-textMuted">
                {prediction.analystConsensus.ratingLabel} ({prediction.analystConsensus.consensusScore}/5.0)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(prediction.analystConsensus.consensusScore / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Sentiment */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-light-text dark:text-dark-text">
                Financial News & Sentiment
              </span>
              <span className="text-light-textMuted dark:text-dark-textMuted">
                {prediction.sentimentScore.label} ({prediction.sentimentScore.score}/100)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{ width: `${prediction.sentimentScore.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Catalysts & Risks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Catalysts */}
        <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Bullish Catalysts</span>
          </div>
          <ul className="space-y-2">
            {prediction.catalysts.map((c, i) => (
              <li key={i} className="text-xs text-light-text dark:text-dark-text flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Key Bearish Risks</span>
          </div>
          <ul className="space-y-2">
            {prediction.risks.map((r, i) => (
              <li key={i} className="text-xs text-light-text dark:text-dark-text flex items-start gap-2 leading-relaxed">
                <span className="text-rose-500 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
