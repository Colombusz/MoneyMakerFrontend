import { describe, it, expect } from 'vitest';
import {
  calculateLinearRegression,
  generateStockPrediction
} from '../stockPredictionEngine';
import { GlobalQuoteData, StockOverviewData, DailyPricePoint } from '../../../types/stocks';

describe('stockPredictionEngine', () => {
  it('calculates linear regression correctly for an upward series', () => {
    const prices = [10, 11, 12, 13, 14, 15];
    const result = calculateLinearRegression(prices);

    expect(result.slope).toBeCloseTo(1.0, 2);
    expect(result.intercept).toBeCloseTo(10.0, 2);
    expect(result.rSquared).toBeCloseTo(1.0, 2);
  });

  it('calculates linear regression correctly for a downward series', () => {
    const prices = [20, 18, 16, 14, 12];
    const result = calculateLinearRegression(prices);

    expect(result.slope).toBeCloseTo(-2.0, 2);
    expect(result.intercept).toBeCloseTo(20.0, 2);
    expect(result.rSquared).toBeCloseTo(1.0, 2);
  });

  it('generates a comprehensive stock prediction with target prices and verdict', () => {
    const quote: GlobalQuoteData = {
      symbol: 'AAPL',
      open: 330,
      high: 335,
      low: 328,
      price: 333.69,
      volume: 33000000,
      latestTradingDay: '2026-10-02',
      previousClose: 330,
      change: 3.69,
      changePercent: '+1.12%',
      changePercentNum: 1.12
    };

    const overview: StockOverviewData = {
      symbol: 'AAPL',
      assetType: 'Common Stock',
      name: 'Apple Inc.',
      description: 'Tech company',
      exchange: 'NASDAQ',
      currency: 'USD',
      country: 'USA',
      sector: 'TECHNOLOGY',
      industry: 'CONSUMER ELECTRONICS',
      marketCapitalization: 4800000000000,
      peRatio: 38,
      pegRatio: 2.5,
      bookValue: 7.3,
      dividendPerShare: 1.0,
      dividendYield: 0.003,
      eps: 8.7,
      week52High: 340,
      week52Low: 215,
      movingAverage50: 320,
      movingAverage200: 290,
      analystTargetPrice: 350,
      analystRatingStrongBuy: 10,
      analystRatingBuy: 20,
      analystRatingHold: 5,
      analystRatingSell: 1,
      analystRatingStrongSell: 0
    };

    const history: DailyPricePoint[] = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-09-${(i + 1).toString().padStart(2, '0')}`,
      open: 300 + i,
      high: 302 + i,
      low: 299 + i,
      close: 301 + i,
      volume: 30000000
    }));

    const news = [
      {
        title: 'Apple records strong quarterly demand',
        url: 'https://example.com',
        timePublished: '20261002T120000',
        authors: ['Reporter'],
        summary: 'Solid growth',
        source: 'News',
        overallSentimentScore: 0.35,
        overallSentimentLabel: 'Bullish'
      }
    ];

    const pred = generateStockPrediction(quote, overview, history, news);

    expect(pred.symbol).toBe('AAPL');
    expect(pred.currentPrice).toBe(333.69);
    expect(pred.target7Day.base).toBeGreaterThan(0);
    expect(pred.target30Day.base).toBeGreaterThan(0);
    expect(pred.confidencePercentage).toBeGreaterThanOrEqual(50);
    expect(['STRONG BUY', 'BUY']).toContain(pred.verdict);
    expect(pred.catalysts.length).toBeGreaterThan(0);
  });
});
