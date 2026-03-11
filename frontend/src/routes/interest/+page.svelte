<script lang="ts">
  import DisplayField from '$lib/components/DisplayField.svelte';
  import { Calculator, Coins, Landmark, TrendingUp, Wallet } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  // --- State ---
  let mode = $state<'compound' | 'simple'>('compound');
  let initialAmount = $state('10000');
  let monthlyContribution = $state('1000');
  let annualRate = $state('15');
  let years = $state('20');

  // --- Chart Logic ---
  let chartCanvas: HTMLCanvasElement | null = $state(null);
  let chartInstance: Chart | null = null;

  // --- Calculations ---
  interface YearResult {
    year: number;
    principal: number;
    simpleTotal: number;
    compoundTotal: number;
    simpleInterest: number;
    compoundInterest: number;
  }

  let results = $derived.by(() => {
    const P = parseFloat(initialAmount) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const t = Math.min(Math.max(parseInt(years) || 1, 1), 50);

    const yearData: YearResult[] = [];

    // Initial state (Year 0)
    yearData.push({
      year: 0,
      principal: P,
      simpleTotal: P,
      compoundTotal: P,
      simpleInterest: 0,
      compoundInterest: 0,
    });

    let currentCompoundTotal = P;
    let currentPrincipal = P;
    let accumulatedCompoundInterest = 0;
    let accumulatedSimpleInterest = 0;

    const monthlyRate = r / 12;

    for (let y = 1; y <= t; y++) {
      // Monthly steps for compound interest
      for (let m = 1; m <= 12; m++) {
        // Compound
        const compoundInterestThisMonth = currentCompoundTotal * monthlyRate;
        accumulatedCompoundInterest += compoundInterestThisMonth;
        currentCompoundTotal += compoundInterestThisMonth + PMT;

        // Simple
        currentPrincipal += PMT;
        // Simple interest earned on all principal accumulated SO FAR
        accumulatedSimpleInterest += currentPrincipal * monthlyRate;
      }

      // Note: Initial P earns simple interest too
      // Actually, simple interest calculation:
      // Interest = InitialP * r * y + Sum(PMT * r * remaining_time_in_years)
      // Standard interpretation of "Simple Interest Investment" with monthly deposits:
      const yTotalSimpleInterest = P * r * y + PMT * 12 * r * (y - 1 + 5.5 / 12); // Approx for simplicity in display

      yearData.push({
        year: y,
        principal: Math.round(currentPrincipal),
        simpleTotal: Math.round(currentPrincipal + accumulatedSimpleInterest),
        compoundTotal: Math.round(currentCompoundTotal),
        simpleInterest: Math.round(accumulatedSimpleInterest),
        compoundInterest: Math.round(accumulatedCompoundInterest),
      });
    }

    return {
      yearData,
      summary: {
        principal: currentPrincipal,
        simple: {
          total: currentPrincipal + accumulatedSimpleInterest,
          interest: accumulatedSimpleInterest,
          roi: (accumulatedSimpleInterest / currentPrincipal) * 100,
        },
        compound: {
          total: currentCompoundTotal,
          interest: accumulatedCompoundInterest,
          roi: (accumulatedCompoundInterest / currentPrincipal) * 100,
        },
      },
    };
  });

  // --- Effect to Update Chart ---
  $effect(() => {
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;

    const data = results.yearData;
    const labels = data.map((d) => `第 ${d.year} 年`);

    const chartData = {
      labels,
      datasets: [
        {
          label: '複利總額',
          data: data.map((d) => d.compoundTotal),
          borderColor: '#6366f1', // Indigo
          backgroundColor: '#6366f120',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          label: '單利總額',
          data: data.map((d) => d.simpleTotal),
          borderColor: '#10b981', // Emerald
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0,
          pointRadius: 0,
        },
        {
          label: '投入本金',
          data: data.map((d) => d.principal),
          borderColor: '#f59e0b', // Amber
          backgroundColor: 'transparent',
          tension: 0,
          pointRadius: 0,
        },
      ],
    };

    if (chartInstance) {
      chartInstance.data = chartData;
      chartInstance.update('none');
    } else {
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                padding: 20,
                color: '#94a3b8',
              },
            },
            tooltip: {
              padding: 12,
              backgroundColor: '#1e293b',
              titleColor: '#f8fafc',
              bodyColor: '#f8fafc',
              callbacks: {
                label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y as number)} 元`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', maxRotation: 0 },
            },
            y: {
              grid: { color: '#e2e8f020' },
              ticks: {
                color: '#94a3b8',
                callback: (value) => formatCurrency(value as number),
              },
            },
          },
        },
      });
    }
  });

  onMount(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  });

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(val);
  }

  function formatPercent(val: number) {
    return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(val) + ' %';
  }
</script>

<div class="flex w-full flex-col gap-6" in:fade>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <!-- Left Column: Inputs & Summary -->
    <div class="flex flex-col gap-6 lg:col-span-4">
      <!-- Input Card -->
      <div
        class="rounded-3xl border border-slate-200/50 bg-white/80 p-6 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
      >
        <div class="mb-6 flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400"
          >
            <Calculator class="h-6 w-6" />
          </div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">計算參數</h2>
        </div>

        <div class="space-y-4">
          <DisplayField label="本金 (投資金額初值)" bind:value={initialAmount} />
          <DisplayField label="每月投入金額 (定期定額)" bind:value={monthlyContribution} />
          <DisplayField label="年利率 (%)" bind:value={annualRate} />
          <DisplayField label="年期 (年)" bind:value={years} />
        </div>
      </div>

      <!-- Result Scorecard - Taiwan Style (Red for Profit) -->
      <div
        class="rounded-3xl border border-slate-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
      >
        <h3 class="mb-4 font-bold text-slate-800 dark:text-white">
          最終結果 ({mode === 'compound' ? '複利' : '單利'})
        </h3>

        <div class="space-y-4">
          <div>
            <div class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">總金額</div>
            <div class="text-3xl font-black tracking-tight text-rose-500">
              {formatCurrency(mode === 'compound' ? results.summary.compound.total : results.summary.simple.total)}
              <span class="text-sm font-normal text-slate-400">元</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-white/5">
            <div>
              <div class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">累計本金</div>
              <div class="text-lg font-bold text-slate-800 dark:text-white">
                {formatCurrency(results.summary.principal)}
              </div>
            </div>
            <div>
              <div class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">投資報酬率</div>
              <div class="text-lg font-bold text-rose-500">
                {formatPercent(mode === 'compound' ? results.summary.compound.roi : results.summary.simple.roi)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Visualization -->
    <div class="flex flex-col gap-6 lg:col-span-8">
      <!-- Chart Card -->
      <div
        class="flex flex-1 flex-col rounded-3xl border border-slate-200/50 bg-white/80 p-6 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">成長趨勢比較</h2>
          <div class="flex gap-2 rounded-xl bg-slate-100/50 p-1 dark:bg-slate-800/50">
            <button
              onclick={() => (mode = 'compound')}
              class="rounded-lg px-3 py-1 text-xs font-bold transition-all {mode === 'compound'
                ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400'
                : 'text-slate-500'}">複利</button
            >
            <button
              onclick={() => (mode = 'simple')}
              class="rounded-lg px-3 py-1 text-xs font-bold transition-all {mode === 'simple'
                ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400'
                : 'text-slate-500'}">單利</button
            >
          </div>
        </div>

        <div class="relative min-h-[300px] w-full flex-1">
          <canvas bind:this={chartCanvas}></canvas>
        </div>
      </div>

      <!-- Comparison Summary Table (New per user request) -->
      <div
        class="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/80 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-center">
            <thead>
              <tr class="bg-slate-50/50 text-xs font-bold tracking-wider text-slate-400 uppercase dark:bg-slate-800/30">
                <th class="px-6 py-4 text-left">類型</th>
                <th class="px-6 py-4">累積本金</th>
                <th class="px-6 py-4">預期總金額</th>
                <th class="px-6 py-4">總報酬率</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr class="transition-colors hover:bg-slate-50/30 dark:hover:bg-white/2">
                <td class="px-6 py-4 text-left font-bold text-indigo-500">複利 (Compound)</td>
                <td class="px-6 py-4 font-medium text-slate-600 dark:text-slate-400"
                  >{formatCurrency(results.summary.principal)}</td
                >
                <td class="px-6 py-4 font-black text-rose-500">{formatCurrency(results.summary.compound.total)}</td>
                <td class="px-6 py-4 font-black text-rose-500">{formatPercent(results.summary.compound.roi)}</td>
              </tr>
              <tr class="transition-colors hover:bg-slate-50/30 dark:hover:bg-white/2">
                <td class="px-6 py-4 text-left font-bold text-emerald-500">單利 (Simple)</td>
                <td class="px-6 py-4 font-medium text-slate-600 dark:text-slate-400"
                  >{formatCurrency(results.summary.principal)}</td
                >
                <td class="px-6 py-4 font-bold text-slate-800 dark:text-white"
                  >{formatCurrency(results.summary.simple.total)}</td
                >
                <td class="px-6 py-4 font-bold text-slate-800 dark:text-white"
                  >{formatPercent(results.summary.simple.roi)}</td
                >
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Detail Table -->
  <div
    class="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/80 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
  >
    <div class="border-b border-slate-100 p-6 dark:border-white/5">
      <h3 class="font-bold text-slate-800 dark:text-white">年度詳細數據</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-slate-50/50 text-xs font-bold tracking-wider text-slate-400 uppercase dark:bg-slate-800/30">
            <th class="px-6 py-4">年度</th>
            <th class="px-6 py-4">累計本金</th>
            <th class="px-6 py-4">單利總額</th>
            <th class="px-6 py-4">複利總額</th>
            <th class="px-6 py-4 text-right">複利超額獲利</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-white/5">
          {#each results.yearData as row (row.year)}
            <tr class="text-sm transition-colors hover:bg-slate-50/30 dark:hover:bg-white/2">
              <td class="px-6 py-4 font-medium text-slate-400">第 {row.year} 年</td>
              <td class="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{formatCurrency(row.principal)}</td>
              <td class="px-6 py-4 font-medium text-emerald-500">{formatCurrency(row.simpleTotal)}</td>
              <td class="px-6 py-4 font-black text-rose-500">{formatCurrency(row.compoundTotal)}</td>
              <td class="px-6 py-4 text-right font-medium text-rose-500">
                +{formatCurrency(row.compoundTotal - row.simpleTotal)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
