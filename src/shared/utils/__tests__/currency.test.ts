import { describe, it, expect } from 'vitest';
import {
  formatCentavos,
  formatCentavosToPHP,
  parseToCentavos,
  centavosToDisplayDecimal
} from '../currency';

describe('currency utilities', () => {
  it('formats positive centavos to PHP correctly', () => {
    expect(formatCentavos(123456, 'PHP')).toBe('₱1,234.56');
    expect(formatCentavosToPHP(500000)).toBe('₱5,000.00');
  });

  it('formats negative centavos with negative sign', () => {
    expect(formatCentavos(-9900, 'PHP')).toBe('-₱99.00');
  });

  it('formats custom currency codes', () => {
    expect(formatCentavos(250000, 'USD')).toBe('USD 2,500.00');
  });

  it('handles zero amount', () => {
    expect(formatCentavos(0, 'PHP')).toBe('₱0.00');
  });

  it('parses numeric values and formatted strings into integer centavos', () => {
    expect(parseToCentavos('1234.56')).toBe(123456);
    expect(parseToCentavos('₱1,234.56')).toBe(123456);
    expect(parseToCentavos(99.5)).toBe(9950);
    expect(parseToCentavos('0')).toBe(0);
    expect(parseToCentavos('')).toBe(0);
  });

  it('converts centavos to display decimal string', () => {
    expect(centavosToDisplayDecimal(500000)).toBe('5000.00');
    expect(centavosToDisplayDecimal(99)).toBe('0.99');
  });
});
