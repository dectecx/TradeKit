import { describe, expect, it } from 'vitest';
import {
  calculateDividendYields,
  calculateFee,
  calculateInterestGrowth,
  calculateTax,
  calculateTrade,
  generateTickLadder,
  getExDividendPrice,
  getNextTick,
  getPrevTick,
  getTickSize,
} from './finance';

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

  describe('Tick Movement (檔位推演)', () => {
    it('correctly calculates next tick price, including bracket boundaries', () => {
      expect(getNextTick(9.99)).toBe(10.0); // 跨 10
      expect(getNextTick(10.0)).toBe(10.05);
      expect(getNextTick(49.95)).toBe(50.0); // 跨 50
      expect(getNextTick(50.0)).toBe(50.1);
      expect(getNextTick(99.9)).toBe(100.0); // 跨 100
      expect(getNextTick(100.0)).toBe(100.5);
      expect(getNextTick(499.5)).toBe(500.0); // 跨 500
      expect(getNextTick(500.0)).toBe(501.0);
      expect(getNextTick(999.0)).toBe(1000.0); // 跨 1000
      expect(getNextTick(1000.0)).toBe(1005.0);
    });

    it('correctly calculates previous tick price, including bracket boundaries', () => {
      expect(getPrevTick(10.05)).toBe(10.0);
      expect(getPrevTick(10.0)).toBe(9.99); // 跨 10往下
      expect(getPrevTick(50.1)).toBe(50.0);
      expect(getPrevTick(50.0)).toBe(49.95); // 跨 50往下
      expect(getPrevTick(100.5)).toBe(100.0);
      expect(getPrevTick(100.0)).toBe(99.9); // 跨 100往下
      expect(getPrevTick(501.0)).toBe(500.0);
      expect(getPrevTick(500.0)).toBe(499.5); // 跨 500往下
      expect(getPrevTick(1005.0)).toBe(1000.0);
      expect(getPrevTick(1000.0)).toBe(999.0); // 跨 1000往下
    });

    it('prevents price falling below minimum viable bounds', () => {
      // 台股實際上沒有 0.01 下一級，測試邏輯閥值兜底
      expect(getPrevTick(0.01)).toBe(0.01);
    });
  });

  describe('Tick Ladder Generator (階梯演算)', () => {
    it('generates a centered ladder with correct bounds', () => {
      const ladder = generateTickLadder(100.0, 1, 0.28, 20, true, 'long', 2, 2);

      expect(ladder).toHaveLength(5); // 2 up, 1 base, 2 down

      // 由高到低排列
      expect(ladder[0].price).toBe(101.0); // +2 tick
      expect(ladder[0].ticks).toBe(2);
      expect(ladder[1].price).toBe(100.5); // +1 tick
      expect(ladder[1].ticks).toBe(1);
      expect(ladder[2].price).toBe(100.0); // base
      expect(ladder[2].ticks).toBe(0);
      expect(ladder[3].price).toBe(99.9); // -1 tick (crosses boundary into 0.1 tick size!)
      expect(ladder[3].ticks).toBe(-1);
      expect(ladder[4].price).toBe(99.8); // -2 tick
      expect(ladder[4].ticks).toBe(-2);
    });

    it('flips profit expectation based on Long/Short direction', () => {
      const longLadder = generateTickLadder(100.0, 1, 0.28, 20, true, 'long', 1, 1);
      const shortLadder = generateTickLadder(100.0, 1, 0.28, 20, true, 'short', 1, 1);

      // 做多: 往上漲(+1 tick) 應該賺錢
      const longUp = longLadder.find((l) => l.ticks === 1)!;
      // 做多: 往下跌(-1 tick) 應該賠錢
      const longDown = longLadder.find((l) => l.ticks === -1)!;

      // 做空: 往上漲(+1 tick) 應該賠錢
      const shortUp = shortLadder.find((l) => l.ticks === 1)!;
      // 做空: 往下跌(-1 tick) 應該賺錢
      const shortDown = shortLadder.find((l) => l.ticks === -1)!;

      // 檢查方向邏輯
      expect(longUp.profit > longDown.profit).toBe(true); // 多單: 漲 > 跌
      expect(shortDown.profit > shortUp.profit).toBe(true); // 空單: 跌 > 漲
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

  describe('Dividend & Yield Calculations (除權息與殖利率)', () => {
    describe('calculateDividendYields', () => {
      it('calculates cash yield correctly', () => {
        // Price: 100, Cash Div: 5, Stock Div: 0 -> Cash Yield: 5%
        const yields = calculateDividendYields(100, 5, 0);
        expect(yields.cashYield).toBe(5);
        expect(yields.stockYield).toBe(0);
        expect(yields.totalYield).toBe(5);
      });

      it('calculates stock yield correctly (based on par value 10)', () => {
        // Price: 100, Cash Div: 0, Stock Div: 1 -> Stock Yield: (1/10)*100 = 10%
        const yields = calculateDividendYields(100, 0, 1);
        expect(yields.cashYield).toBe(0);
        expect(yields.stockYield).toBe(10);
        expect(yields.totalYield).toBe(10);
      });

      it('calculates combined total yield correctly', () => {
        // Price: 100, Cash Div: 5, Stock Div: 1.2
        // Cash Yield = 5%
        // Stock Yield = 12%
        // Total Yield = 17%
        const yields = calculateDividendYields(100, 5, 1.2);
        expect(yields.cashYield).toBe(5);
        expect(yields.stockYield).toBe(12);
        expect(yields.totalYield).toBe(17);
      });

      it('handles zero values cleanly', () => {
        const yields = calculateDividendYields(100, 0, 0);
        expect(yields.cashYield).toBe(0);
        expect(yields.stockYield).toBe(0);
        expect(yields.totalYield).toBe(0);
      });
    });

    describe('getExDividendPrice', () => {
      it('calculates Ex-Dividend (只除息) correctly', () => {
        // Price: 100, Cash Div: 5 -> Result: 95
        expect(getExDividendPrice(100, 5, 0)).toBe(95);
      });

      it('calculates Ex-Right (只除權) correctly', () => {
        // Price: 100, Stock Div: 1 -> Result: 100 / (1 + (1/10)) = 100 / 1.1 = 90.9090...
        // Assuming round to 2 decimal places for standard display or test strictly
        const price = getExDividendPrice(100, 0, 1);
        expect(price).toBeCloseTo(90.91, 2);
      });

      it('calculates simultaneous Ex-Dividend and Ex-Right (同時除權息) correctly', () => {
        // Formula: 先計算除息再計算除權
        // Price: 100, Cash Div: 5, Stock Div: 1
        // Step 1: 100 - 5 = 95
        // Step 2: 95 / (1 + (1/10)) = 95 / 1.1 = 86.3636...
        const price = getExDividendPrice(100, 5, 1);
        expect(price).toBeCloseTo(86.36, 2);
      });

      it('handles zero divisions gracefully', () => {
        expect(getExDividendPrice(100, 0, 0)).toBe(100);
      });
    });
  });

  describe('Interest & Growth Calculations (利息計算推演)', () => {
    const p = 10000;
    const pmt = 1000;
    const r = 0.15; // 15%

    it('calculates Simple Interest Growth correctly for 1 year', () => {
      // Manual verification: (11k + 12k + ... + 22k) * (0.15/12) = 2,475
      const result = calculateInterestGrowth(p, pmt, r, 1, 'simple');
      expect(result.summary.principal).toBe(22000);
      expect(result.summary.interest).toBe(2475);
      expect(result.summary.total).toBe(24475);
    });

    it('calculates Compound Interest Growth correctly for 1 year', () => {
      // Month 1: (10k + 1k) * 1.0125 = 11,137.5
      const result = calculateInterestGrowth(p, pmt, r, 1, 'compound');
      expect(result.summary.principal).toBe(22000);
      // Compound should be > Simple
      expect(result.summary.total).toBeGreaterThan(24475);
      expect(result.summary.total).toBe(24629); // (Expected for monthly compound with start-of-month pmt)
    });

    it('handles zero interest rate correctly', () => {
      const result = calculateInterestGrowth(p, pmt, 0, 1, 'compound');
      expect(result.summary.interest).toBe(0);
      expect(result.summary.total).toBe(22000);
    });

    it('handles zero monthly contribution correctly', () => {
      // 10,000 * (1 + 0.15/12)^12 = 11,607.54... round to 11,608
      const result = calculateInterestGrowth(10000, 0, 0.15, 1, 'compound');
      expect(result.summary.total).toBe(11608);
      expect(result.summary.interest).toBe(1608);
    });
  });
});
