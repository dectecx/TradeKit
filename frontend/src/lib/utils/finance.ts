import Decimal from 'decimal.js';

export const FEE_RATE = new Decimal('0.001425');
export const TAX_RATE_NORMAL = new Decimal('0.003');
export const TAX_RATE_DAY_TRADE = new Decimal('0.0015');

/**
 * 計算單筆交易手續費
 * 公式：floor(成交價 * 張數 * 1000 * 0.001425 * 手續費折數)
 *
 * @param price 成交價
 * @param quantity 交易張數 (1張 = 1000股)
 * @param discount 券商手續費折數 (例：2.8折 = 0.28)
 * @param minFee 單筆最低收取手續費 (預設：20)
 * @returns 經無條件捨去後的手續費整數
 */
export function calculateFee(
  price: number | string,
  quantity: number,
  discount: number | string,
  minFee: number = 20
): number {
  const p = new Decimal(price);
  const q = new Decimal(quantity).times(1000); // Convert lots to shares
  const d = new Decimal(discount);

  const rawFee = p.times(q).times(FEE_RATE).times(d);
  const flooredFee = rawFee.floor();

  return Decimal.max(flooredFee, new Decimal(minFee)).toNumber();
}

/**
 * 計算賣出交易稅
 * 公式：floor(成交價 * 張數 * 1000 * 稅率)
 *
 * @param price 賣出成交價
 * @param quantity 交易張數 (1張 = 1000股)
 * @param isDayTrade 是否為當沖交易 (當沖稅率減半)
 * @returns 經無條件捨去後的交易稅整數
 */
export function calculateTax(price: number | string, quantity: number, isDayTrade: boolean = false): number {
  const p = new Decimal(price);
  const q = new Decimal(quantity).times(1000);
  const rate = isDayTrade ? TAX_RATE_DAY_TRADE : TAX_RATE_NORMAL;

  return p.times(q).times(rate).floor().toNumber();
}

/**
 * 取得台股規定之升降單位 (Tick Size)
 *
 * @param price 股價
 * @returns 該股價區間對應的最小跳動單位
 */
export function getTickSize(price: number | string): number {
  const p = new Decimal(price);

  if (p.lt(10)) return 0.01;
  if (p.lt(50)) return 0.05;
  if (p.lt(100)) return 0.1;
  if (p.lt(500)) return 0.5;
  if (p.lt(1000)) return 1;
  return 5;
}

/**
 * 買賣完整交易的綜合損益試算
 *
 * @param buyPrice 買進價格
 * @param sellPrice 賣出價格
 * @param quantity 交易張數
 * @param discount 手續費折數
 * @param minFee 最低手續費
 * @param isDayTrade 是否為當沖交易
 * @returns 包含各項成本與最終淨損益的計算結果
 */
export function calculateTrade(
  buyPrice: number | string,
  sellPrice: number | string,
  quantity: number,
  discount: number | string,
  minFee: number = 20,
  isDayTrade: boolean = false
) {
  const qShares = new Decimal(quantity).times(1000);

  // Buy side (Cost = Value + Fee)
  const buyValue = new Decimal(buyPrice).times(qShares);
  const buyFee = calculateFee(buyPrice, quantity, discount, minFee);
  const totalCost = buyValue.plus(buyFee).toNumber();

  // Sell side (Revenue = Value - Fee - Tax)
  const sellValue = new Decimal(sellPrice).times(qShares);
  const sellFee = calculateFee(sellPrice, quantity, discount, minFee);
  const sellTax = calculateTax(sellPrice, quantity, isDayTrade);
  const netRevenue = sellValue.minus(sellFee).minus(sellTax).toNumber();

  // Profit
  const profit = new Decimal(netRevenue).minus(totalCost).toNumber();

  return {
    buyFee,
    sellFee,
    sellTax,
    totalCost,
    netRevenue,
    profit,
  };
}

/**
 * 取得上一個跳動檔位加一檔的價位
 * (過渡級距時能自動應對，例如 99.9 加上一檔會變成 100.0)
 */
export function getNextTick(price: number | string): number {
  const p = new Decimal(price);
  const tickSize = getTickSize(p.toNumber());
  // 處理跨級距問題: 若 p = 99.9, tickSize = 0.1, 99.9 + 0.1 = 100.0 (下一檔 tickSize 變為 0.5 但不影響這次跨越)
  return p.plus(tickSize).toNumber();
}

/**
 * 取得下一個跳動檔位減一檔的價位
 * (過度級距時需參考退一級的 tick size，例如 100.0 減一檔是由 99.9 跳上來的，所以減 0.1)
 */
export function getPrevTick(price: number | string): number {
  const p = new Decimal(price);

  // 為了精確抓取往下的級距，我們先稍微減去一點點極小值，來判斷究竟屬於哪個位階
  // 例如 p = 100.0 時，100.0 所在的 getTickSize 是 0.5 (即 100 變 100.5)
  // 但往下減必須是減 0.1 (變成 99.9)
  const bracketPrice = p.minus(0.0001).toNumber();
  const tickSize = getTickSize(bracketPrice);

  // 台股最低價不可小於等於0
  return Decimal.max(p.minus(tickSize), new Decimal(0.01)).toNumber();
}

export type TickLadderRow = {
  price: number;
  ticks: number; // 與基準價的距離 (正數為上漲，負數為下跌)
  profit: number; // 淨損益 (包含手續費與稅)
  fee: number; // 單邊或雙邊手續費總和 (buyFee + sellFee)
  tax: number; // 交易稅
  percentChange: number; // 漲跌幅百分比
};

/**
 * 產生價位階梯推演表 (包含做多/做空邏輯)
 *
 * @param basePrice 基準價 (做多為買進價，做空為賣出價)
 * @param quantity 張數
 * @param discount 折數
 * @param minFee 最低手續費
 * @param isDayTrade 是否為當沖
 * @param direction 'long' (做多) 或 'short' (做空)
 * @param upTicks 往上顯示幾檔 (預設 5)
 * @param downTicks 往下顯示幾檔 (預設 5)
 * @returns 包含各檔位詳細數據陣列 (由高價位排到低價位)
 */
export function generateTickLadder(
  basePrice: number | string,
  quantity: number,
  discount: number | string,
  minFee: number = 20,
  isDayTrade: boolean = false,
  direction: 'long' | 'short' = 'long',
  upTicks: number = 5,
  downTicks: number = 5
): TickLadderRow[] {
  const ladder: TickLadderRow[] = [];
  const base = new Decimal(basePrice).toNumber();

  if (isNaN(base) || base <= 0) return [];

  // 1. 生成往上跳的檔位
  let currentPrice = base;
  for (let i = 1; i <= upTicks; i++) {
    currentPrice = getNextTick(currentPrice);
    const result =
      direction === 'long'
        ? calculateTrade(base, currentPrice, quantity, discount, minFee, isDayTrade)
        : calculateTrade(currentPrice, base, quantity, discount, minFee, isDayTrade);

    ladder.push({
      price: currentPrice,
      ticks: i,
      profit: result.profit,
      fee: result.buyFee + result.sellFee,
      tax: result.sellTax,
      percentChange: ((currentPrice - base) / base) * 100,
    });
  }

  // 2. 為了確保顯示是由大(高價)到小(低價)，將剛才生成的上漲區段顛倒
  ladder.reverse();

  // 3. 加入基準價(0檔)
  const baseResult =
    direction === 'long'
      ? calculateTrade(base, base, quantity, discount, minFee, isDayTrade)
      : calculateTrade(base, base, quantity, discount, minFee, isDayTrade);

  ladder.push({
    price: base,
    ticks: 0,
    profit: baseResult.profit,
    fee: baseResult.buyFee + baseResult.sellFee,
    tax: baseResult.sellTax,
    percentChange: 0,
  });

  // 4. 生產往下跳的檔位
  currentPrice = base;
  for (let i = 1; i <= downTicks; i++) {
    currentPrice = getPrevTick(currentPrice);
    if (currentPrice <= 0) break; // 避免跌破0

    const result =
      direction === 'long'
        ? calculateTrade(base, currentPrice, quantity, discount, minFee, isDayTrade)
        : calculateTrade(currentPrice, base, quantity, discount, minFee, isDayTrade);

    ladder.push({
      price: currentPrice,
      ticks: -i,
      profit: result.profit,
      fee: result.buyFee + result.sellFee,
      tax: result.sellTax,
      percentChange: ((currentPrice - base) / base) * 100,
    });
  }

  return ladder;
}

/**
 * 計算除權息殖利率 (Cash Yield, Stock Yield, Total Yield)
 * @param price 除權息前股價
 * @param cashDividend 現金股利 (元)
 * @param stockDividend 股票股利 (元)
 * @returns { cashYield: number, stockYield: number, totalYield: number }
 */
export function calculateDividendYields(
  price: number,
  cashDividend: number,
  stockDividend: number
): { cashYield: number; stockYield: number; totalYield: number } {
  if (price <= 0) {
    return { cashYield: 0, stockYield: 0, totalYield: 0 };
  }

  const priceDec = new Decimal(price);
  const cashDivDec = new Decimal(cashDividend);
  const stockDivDec = new Decimal(stockDividend);

  // 現金殖利率 = (現金股利 / 股價) * 100%
  const cashYield = cashDivDec.dividedBy(priceDec).times(100).toDecimalPlaces(2).toNumber();

  // 股票股利殖利率 (台股) = (股票股利 / 股票發行面額(通常為10)) * 100%
  const stockYield = stockDivDec.dividedBy(10).times(100).toDecimalPlaces(2).toNumber();

  // 總殖利率
  const totalYield = new Decimal(cashYield).plus(stockYield).toNumber();

  return {
    cashYield,
    stockYield,
    totalYield,
  };
}

/**
 * 計算除權息後參考價
 * 台股公式：同時除權除息 -> 先除息再除權
 * @param price 除權息前股價
 * @param cashDividend 現金股利 (元)
 * @param stockDividend 股票股利 (元)
 * @returns 除權息後參考價
 */
export function getExDividendPrice(price: number, cashDividend: number, stockDividend: number): number {
  if (price <= 0) return 0;

  const priceDec = new Decimal(price);
  const cashDivDec = new Decimal(cashDividend);
  const stockDivDec = new Decimal(stockDividend);

  // 1. 先除息 (Price - Cash Div)
  const afterCashDivPrice = priceDec.minus(cashDivDec);

  // 2. 再除權 (AfterCashDivPrice / (1 + (Stock Div / 10)))
  // 股票面額為 10
  const stockDivRatio = stockDivDec.dividedBy(10);
  const divisor = new Decimal(1).plus(stockDivRatio);

  const finalPrice = afterCashDivPrice.dividedBy(divisor);

  // 回傳小數點後四捨五入兩位
  return finalPrice.toDecimalPlaces(2).toNumber();
}
