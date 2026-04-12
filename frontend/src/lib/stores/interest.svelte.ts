import { calculateInterestGrowth } from '$lib/utils/finance';

export function createInterestStore() {
  let initialAmountStr = $state('');
  let monthlyContributionStr = $state('');
  let annualRateStr = $state('5');
  let yearsStr = $state('10');
  let mode = $state<'compound' | 'simple'>('compound');

  const initialAmount = $derived(Number(initialAmountStr) || 0);
  const monthlyContribution = $derived(Number(monthlyContributionStr) || 0);
  const annualRate = $derived(Number(annualRateStr) / 100 || 0);
  const years = $derived(Number(yearsStr) || 0);

  const result = $derived.by(() => {
    if (initialAmount <= 0 && monthlyContribution <= 0) return null;
    return calculateInterestGrowth(initialAmount, monthlyContribution, annualRate, years, mode);
  });

  return {
    get initialAmountStr() { return initialAmountStr; },
    set initialAmountStr(v) { initialAmountStr = v; },
    get monthlyContributionStr() { return monthlyContributionStr; },
    set monthlyContributionStr(v) { monthlyContributionStr = v; },
    get annualRateStr() { return annualRateStr; },
    set annualRateStr(v) { annualRateStr = v; },
    get yearsStr() { return yearsStr; },
    set yearsStr(v) { yearsStr = v; },
    get mode() { return mode; },
    set mode(v) { mode = v; },
    get result() { return result; }
  };
}

export const interestStore = createInterestStore();
