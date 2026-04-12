import { browser } from '$app/environment';
import { calculateInterestGrowth } from '$lib/utils/finance';

class InterestStore {
  initialAmountStr = $state('0');
  monthlyContributionStr = $state('0');
  annualRateStr = $state('5');
  yearsStr = $state('10');
  mode = $state<'compound' | 'simple'>('compound');

  initialAmount = $derived(Number(this.initialAmountStr) || 0);
  monthlyContribution = $derived(Number(this.monthlyContributionStr) || 0);
  annualRate = $derived(Number(this.annualRateStr) / 100 || 0);
  years = $derived(Number(this.yearsStr) || 0);

  result = $derived.by(() => {
    if (this.initialAmount <= 0 && this.monthlyContribution <= 0) return null;
    return calculateInterestGrowth(this.initialAmount, this.monthlyContribution, this.annualRate, this.years, this.mode);
  });

  constructor() {
    if (browser) {
      const storedInitial = localStorage.getItem('tk_int_initial');
      if (storedInitial) this.initialAmountStr = storedInitial;

      const storedMonthly = localStorage.getItem('tk_int_monthly');
      if (storedMonthly) this.monthlyContributionStr = storedMonthly;

      const storedRate = localStorage.getItem('tk_int_rate');
      if (storedRate) this.annualRateStr = storedRate;

      const storedYears = localStorage.getItem('tk_int_years');
      if (storedYears) this.yearsStr = storedYears;

      const storedMode = localStorage.getItem('tk_int_mode');
      if (storedMode) this.mode = storedMode as 'compound' | 'simple';

      $effect.root(() => {
        $effect(() => { localStorage.setItem('tk_int_initial', this.initialAmountStr); });
        $effect(() => { localStorage.setItem('tk_int_monthly', this.monthlyContributionStr); });
        $effect(() => { localStorage.setItem('tk_int_rate', this.annualRateStr); });
        $effect(() => { localStorage.setItem('tk_int_years', this.yearsStr); });
        $effect(() => { localStorage.setItem('tk_int_mode', this.mode); });
      });
    }
  }
}

export const interestStore = new InterestStore();
