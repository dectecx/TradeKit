import { describe, expect, it } from 'vitest';
import { calculateFee, calculateTax, calculateTrade, getTickSize } from './finance';

describe('TradeKit Financial Calculations', () => {
  describe('Fee Calculation (無條件捨去)', () => {
    it('should accurately calculate fee for 100元, 1張, 2.8折, 20低收', () => {
      // Price = 100, Quantity = 1 (1000 shares)
      // Value = 100,000
      // Fee = floor(100,000 * 0.001425 * 0.28) = floor(39.9) = 39
      const fee = calculateFee(100, 1, 0.28, 20);
      expect(fee).toBe(39);
    });

    it('should apply minimum fee if calculated fee is lower', () => {
      // Price = 10, Quantity = 1 (1000 shares)
      // Value = 10,000
      // Fee = floor(10,000 * 0.001425 * 0.28) = floor(3.99) = 3
      // Should return 20 (minFee)
      const fee = calculateFee(10, 1, 0.28, 20);
      expect(fee).toBe(20);
    });

    it('should accurately calculate fee for exact whole numbers without rounding issues', () => {
      // 100,000 * 0.001425 = 142.5. If 10折 (1.0)
      // floor(142.5) = 142
      const fee = calculateFee(100, 1, 1, 20);
      expect(fee).toBe(142);
    });
  });

  describe('Tax Calculation (交易稅)', () => {
    it('should calculate standard tax (0.3%) unconditionally rounded down', () => {
      // 100元, 1張 = 100,000
      // Tax = floor(100,000 * 0.003) = 300
      expect(calculateTax(100, 1, false)).toBe(300);

      // 99.9元, 1張 = 99,900
      // Tax = floor(99,900 * 0.003) = floor(299.7) = 299
      expect(calculateTax(99.9, 1, false)).toBe(299);
    });

    it('should calculate day trade tax (0.15%) unconditionally rounded down', () => {
      // 100元, 1張 = 100,000
      // Tax = floor(100,000 * 0.0015) = 150
      expect(calculateTax(100, 1, true)).toBe(150);

      // 111元, 1張 = 111,000
      // Tax = floor(111,000 * 0.0015) = floor(166.5) = 166
      expect(calculateTax(111, 1, true)).toBe(166);
    });
  });

  describe('Tick Size (升降單位)', () => {
    it('returns correct tick sizes based on brackets', () => {
      expect(getTickSize(9.99)).toBe(0.01);
      expect(getTickSize(10)).toBe(0.05);
      expect(getTickSize(49.95)).toBe(0.05);
      expect(getTickSize(50)).toBe(0.1);
      expect(getTickSize(99.9)).toBe(0.1);
      expect(getTickSize(100)).toBe(0.5);
      expect(getTickSize(499.5)).toBe(0.5);
      expect(getTickSize(500)).toBe(1);
      expect(getTickSize(999)).toBe(1);
      expect(getTickSize(1000)).toBe(5);
      expect(getTickSize(2500)).toBe(5);
    });
  });

  describe('Calculate Trade (買賣綜合計算)', () => {
    it('calculates full day trade scenario correctly', () => {
      // Day trade: Buy at 100, Sell at 101, 1 lot, 2.8折, 20 MinFee
      const result = calculateTrade(100, 101, 1, 0.28, 20, true);

      // Buy Fee = floor(100,000 * 0.001425 * 0.28) = 39
      // Total Cost = 100,000 + 39 = 100,039
      expect(result.buyFee).toBe(39);
      expect(result.totalCost).toBe(100039);

      // Sell Fee = floor(101,000 * 0.001425 * 0.28) = floor(40.299) = 40
      expect(result.sellFee).toBe(40);

      // Sell Tax (Day trade) = floor(101,000 * 0.0015) = floor(151.5) = 151
      expect(result.sellTax).toBe(151);

      // Net Revenue = 101,000 - 40 - 151 = 100,809
      expect(result.netRevenue).toBe(100809);

      // Profit = 100,809 - 100,039 = 770
      expect(result.profit).toBe(770);
    });
  });
});
