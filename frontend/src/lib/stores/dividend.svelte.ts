import { getExDividendPrice } from '$lib/utils/finance';

export function createDividendStore() {
  let priceStr = $state('');
  let cashDivStr = $state('');
  let stockDivStr = $state('');

  const price = $derived(Number(priceStr) || 0);
  const cashDiv = $derived(Number(cashDivStr) || 0);
  const stockDiv = $derived(Number(stockDivStr) || 0);

  const exDivPrice = $derived(getExDividendPrice(price, cashDiv, stockDiv));
  const showFormulas = $derived(price > 0 && (cashDiv > 0 || stockDiv > 0));

  return {
    get priceStr() { return priceStr; },
    set priceStr(v) { priceStr = v; },
    get cashDivStr() { return cashDivStr; },
    set cashDivStr(v) { cashDivStr = v; },
    get stockDivStr() { return stockDivStr; },
    set stockDivStr(v) { stockDivStr = v; },
    get price() { return price; },
    get cashDiv() { return cashDiv; },
    get stockDiv() { return stockDiv; },
    get exDivPrice() { return exDivPrice; },
    get showFormulas() { return showFormulas; }
  };
}

export const dividendStore = createDividendStore();
