import { browser } from '$app/environment';
import { getExDividendPrice } from '$lib/utils/finance';

class DividendStore {
  priceStr = $state('0');
  cashDivStr = $state('0');
  stockDivStr = $state('0');

  price = $derived(Number(this.priceStr) || 0);
  cashDiv = $derived(Number(this.cashDivStr) || 0);
  stockDiv = $derived(Number(this.stockDivStr) || 0);

  exDivPrice = $derived(getExDividendPrice(this.price, this.cashDiv, this.stockDiv));
  showFormulas = $derived(this.price > 0 && (this.cashDiv > 0 || this.stockDiv > 0));

  constructor() {
    if (browser) {
      const storedPrice = localStorage.getItem('tk_div_price');
      if (storedPrice) this.priceStr = storedPrice;

      const storedCash = localStorage.getItem('tk_div_cash');
      if (storedCash) this.cashDivStr = storedCash;

      const storedStock = localStorage.getItem('tk_div_stock');
      if (storedStock) this.stockDivStr = storedStock;

      $effect.root(() => {
        $effect(() => { localStorage.setItem('tk_div_price', this.priceStr); });
        $effect(() => { localStorage.setItem('tk_div_cash', this.cashDivStr); });
        $effect(() => { localStorage.setItem('tk_div_stock', this.stockDivStr); });
      });
    }
  }
}

export const dividendStore = new DividendStore();
