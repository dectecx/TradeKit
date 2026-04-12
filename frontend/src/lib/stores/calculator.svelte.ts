import { browser } from '$app/environment';
import { calculateTrade, generateTickLadder } from '$lib/utils/finance';
import { settings } from './settings.svelte';

class CalculatorStore {
  buyPrice = $state('0');
  sellPrice = $state('0');
  basePrice = $state('0');
  quantity = $state('1');
  tradeDirection = $state<'long' | 'short'>('long');
  calcMode = $state<'single' | 'ladder'>('ladder');
  ladderRows = $state(settings.defaultLadderRows);

  // Derived results
  singleResult = $derived.by(() => {
    const b = parseFloat(this.buyPrice);
    const s = parseFloat(this.sellPrice);
    const q = parseInt(this.quantity);
    const d = parseFloat(settings.discount) / 10;
    const m = parseInt(settings.minFee);

    if (isNaN(b) || isNaN(s) || isNaN(q) || b <= 0 || s <= 0 || q <= 0) return null;

    return calculateTrade(b, s, q, d, m, settings.isDayTrade);
  });

  ladderResult = $derived.by(() => {
    const b = parseFloat(this.basePrice);
    const q = parseInt(this.quantity);
    const d = parseFloat(settings.discount) / 10;
    const m = parseInt(settings.minFee);

    if (isNaN(b) || b <= 0 || isNaN(q) || q <= 0) return null;

    return generateTickLadder(b, q, d, m, settings.isDayTrade, this.tradeDirection, this.ladderRows, this.ladderRows);
  });

  constructor() {
    if (browser) {
      const storedBuy = localStorage.getItem('tk_calc_buyPrice');
      if (storedBuy) this.buyPrice = storedBuy;

      const storedSell = localStorage.getItem('tk_calc_sellPrice');
      if (storedSell) this.sellPrice = storedSell;

      const storedBase = localStorage.getItem('tk_calc_basePrice');
      if (storedBase) this.basePrice = storedBase;

      const storedQty = localStorage.getItem('tk_calc_quantity');
      if (storedQty) this.quantity = storedQty;

      const storedDirection = localStorage.getItem('tk_calc_tradeDirection');
      if (storedDirection) this.tradeDirection = storedDirection as 'long' | 'short';

      const storedMode = localStorage.getItem('tk_calc_mode');
      if (storedMode) this.calcMode = storedMode as 'single' | 'ladder';

      // Auto-save effects
      $effect.root(() => {
        $effect(() => { localStorage.setItem('tk_calc_buyPrice', this.buyPrice); });
        $effect(() => { localStorage.setItem('tk_calc_sellPrice', this.sellPrice); });
        $effect(() => { localStorage.setItem('tk_calc_basePrice', this.basePrice); });
        $effect(() => { localStorage.setItem('tk_calc_quantity', this.quantity); });
        $effect(() => { localStorage.setItem('tk_calc_tradeDirection', this.tradeDirection); });
        $effect(() => { localStorage.setItem('tk_calc_mode', this.calcMode); });
      });
    }
  }

  resetLadderRows() {
    this.ladderRows = settings.defaultLadderRows;
  }
}

export const calculator = new CalculatorStore();
