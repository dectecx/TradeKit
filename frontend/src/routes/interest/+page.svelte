<script lang="ts">
  import DisplayField from '$lib/components/DisplayField.svelte';
  import { Calculator, Landmark, TrendingUp, Wallet } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';

  // --- State ---
  let mode = $state<'compound' | 'simple'>('compound');
  let initialAmount = $state('100000');
  let monthlyContribution = $state('10000');
  let annualRate = $state('5');
  let years = $state('10');

  // --- Calculations ---
  interface YearResult {
    year: number;
    principal: number;
    interest: number;
    total: number;
  }

  let results = $derived.by(() => {
    const P = parseFloat(initialAmount) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const t = Math.min(Math.max(parseInt(years) || 1, 1), 50); // Limit to 50 years to prevent performance issues

    const yearData: YearResult[] = [];
    let currentTotal = P;
    let currentPrincipal = P;
    let accumulatedInterest = 0;

    if (mode === 'compound') {
      const monthlyRate = r / 12;
      for (let y = 1; y <= t; y++) {
        for (let m = 1; m <= 12; m++) {
          const interestThisMonth = currentTotal * monthlyRate;
          accumulatedInterest += interestThisMonth;
          currentTotal += interestThisMonth + PMT;
          currentPrincipal += PMT;
        }
        yearData.push({
          year: y,
          principal: Math.round(currentPrincipal),
          interest: Math.round(accumulatedInterest),
          total: Math.round(currentTotal),
        });
      }
    } else {
      // Simple Interest
      // Interest = Principal * Rate * Time
      // Each contribution earns simple interest for the remaining time
      for (let y = 1; y <= t; y++) {
        // Interest on initial principal for this year
        accumulatedInterest += P * r;

        // Interest on monthly contributions made in THIS year
        // M1 gets 12/12, M2 gets 11/12... Avg is 6.5/12
        // Actually, let's just calculate monthly for consistency in display
        for (let m = 1; m <= 12; m++) {
          currentPrincipal += PMT;
          // Each contribution earns simple interest until the end of the term?
          // Usually "Simple Interest on a loan" is fixed.
          // For an investment, we'll calculate interest earned on all principal accumulated SO FAR.
          accumulatedInterest += currentPrincipal * (r / 12);
        }

        yearData.push({
          year: y,
          principal: Math.round(currentPrincipal),
          interest: Math.round(accumulatedInterest),
          total: Math.round(currentPrincipal + accumulatedInterest),
        });
      }
    }

    return {
      yearData,
      finalTotal: yearData[yearData.length - 1]?.total || 0,
      totalPrincipal: Math.round(currentPrincipal),
      totalInterest: Math.round(accumulatedInterest),
    };
  });

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(val);
  }
</script>

<div class="flex w-full flex-col gap-6" in:fade>
  <!-- Input Card -->
  <div
    class="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/80 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
  >
    <!-- Header -->
    <div class="border-b border-slate-100 p-6 dark:border-white/5">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400"
          >
            <Calculator class="h-6 w-6" />
          </div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">成長推演</h2>
        </div>
      </div>

      <!-- Mode Switcher -->
      <div class="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/50 p-1.5 dark:bg-slate-800/50">
        <button
          onclick={() => (mode = 'compound')}
          class="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all
                {mode === 'compound'
            ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        >
          <TrendingUp class="h-4 w-4" />
          複利計算 (利滾利)
        </button>
        <button
          onclick={() => (mode = 'simple')}
          class="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all
                {mode === 'simple'
            ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        >
          <Calculator class="h-4 w-4" />
          單利計算
        </button>
      </div>
    </div>

    <!-- Fields Content -->
    <div class="space-y-4 p-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DisplayField label="初始投入本金 (Principal)" bind:value={initialAmount} />
        <DisplayField label="每月再投入 (Monthly)" bind:value={monthlyContribution} />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DisplayField label="年化報酬率 % (Rate)" bind:value={annualRate} />
        <DisplayField label="投資年期 (Years)" bind:value={years} />
      </div>

      <p class="px-2 text-xs text-slate-400 dark:text-slate-500">
        * 計算假設：{mode === 'compound' ? '利息按月複利計算。' : '利息僅按現有本金計算，不計入已產生的利息。'}
      </p>
    </div>
  </div>

  <!-- Results Summary -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div
      class="rounded-3xl border border-slate-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
    >
      <div class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Wallet class="h-4 w-4" />
        累計投入本金
      </div>
      <div class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
        {formatCurrency(results.totalPrincipal)} <span class="ml-1 text-sm font-normal text-slate-400">元</span>
      </div>
    </div>

    <div
      class="rounded-3xl border border-slate-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
    >
      <div class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Landmark class="h-4 w-4" />
        預期累計獲利
      </div>
      <div class="text-2xl font-black tracking-tight text-emerald-500">
        + {formatCurrency(results.totalInterest)} <span class="ml-1 text-sm font-normal text-slate-400">元</span>
      </div>
    </div>

    <div class="rounded-3xl bg-sky-500 p-6 shadow-xl shadow-sky-500/20 dark:shadow-none">
      <div class="mb-2 flex items-center gap-2 text-sm font-medium text-sky-100">
        <TrendingUp class="h-4 w-4" />
        預期總金額
      </div>
      <div class="text-2xl font-black tracking-tight text-white">
        {formatCurrency(results.finalTotal)} <span class="ml-1 text-sm font-normal text-sky-200">元</span>
      </div>
    </div>
  </div>

  <!-- Detail Table -->
  <div
    class="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/80 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
  >
    <div class="border-b border-slate-100 p-6 dark:border-white/5">
      <h3 class="font-bold text-slate-800 dark:text-white">年度發展明細</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-slate-50/50 text-xs font-bold tracking-wider text-slate-400 uppercase dark:bg-slate-800/30">
            <th class="px-6 py-4">年度</th>
            <th class="px-6 py-4">累計投入</th>
            <th class="px-6 py-4">累計獲利</th>
            <th class="px-6 py-4 text-right">預期總額</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-white/5">
          {#each results.yearData as row (row.year)}
            <tr class="text-sm transition-colors hover:bg-slate-50/30 dark:hover:bg-white/2">
              <td class="px-6 py-4 font-medium text-slate-400">第 {row.year} 年</td>
              <td class="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{formatCurrency(row.principal)}</td>
              <td class="px-6 py-4 font-bold text-emerald-500">+{formatCurrency(row.interest)}</td>
              <td class="px-6 py-4 text-right font-black text-slate-900 dark:text-white">{formatCurrency(row.total)}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
