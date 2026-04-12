import { calculateTrade, generateTickLadder } from '$lib/utils/finance';
import { settings } from './settings.svelte';

export function createCalculator() {
  let buyPrice = $state('');
  let sellPrice = $state('');
  let basePrice = $state('');
  let quantity = $state('1');
  let tradeDirection = $state<'long' | 'short'>('long');
  let calcMode = $state<'single' | 'ladder'>('ladder');
  let ladderRows = $state(settings.defaultLadderRows);

  // Derived results
  const singleResult = $derived.by(() => {
    const b = parseFloat(buyPrice);
    const s = parseFloat(sellPrice);
    const q = parseInt(quantity);
    const d = parseFloat(settings.discount) / 10;
    const m = parseInt(settings.minFee);

    if (isNaN(b) || isNaN(s) || isNaN(q) || b <= 0 || s <= 0 || q <= 0) return null;

    return calculateTrade(b, s, q, d, m, settings.isDayTrade);
  });

  const ladderResult = $derived.by(() => {
    const b = parseFloat(basePrice);
    const q = parseInt(quantity);
    const d = parseFloat(settings.discount) / 10;
    const m = parseInt(settings.minFee);

    if (isNaN(b) || b <= 0 || isNaN(q) || q <= 0) return null;

    return generateTickLadder(b, q, d, m, settings.isDayTrade, tradeDirection, ladderRows, ladderRows);
  });

  return {
    get buyPrice() { return buyPrice; },
    set buyPrice(v) { buyPrice = v; },
    get sellPrice() { return sellPrice; },
    set sellPrice(v) { sellPrice = v; },
    get basePrice() { return basePrice; },
    set basePrice(v) { basePrice = v; },
    get quantity() { return quantity; },
    set quantity(v) { quantity = v; },
    get tradeDirection() { return tradeDirection; },
    set tradeDirection(v) { tradeDirection = v; },
    get calcMode() { return calcMode; },
    set calcMode(v) { calcMode = v; },
    get ladderRows() { return ladderRows; },
    set ladderRows(v) { ladderRows = v; },
    
    get singleResult() { return singleResult; },
    get ladderResult() { return ladderResult; },

    resetLadderRows() {
      ladderRows = settings.defaultLadderRows;
    }
  };
}

export const calculator = createCalculator();
