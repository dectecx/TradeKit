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
