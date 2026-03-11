<script lang="ts">
  import DisplayField from '$lib/components/DisplayField.svelte';
  import { calculateInterestGrowth } from '$lib/utils/finance';
  import Chart from 'chart.js/auto';
  import { Calculator } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

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
  let results = $derived.by(() => {
    const p = parseFloat(initialAmount) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const t = Math.min(Math.max(parseInt(years) || 1, 1), 50);

    const compoundData = calculateInterestGrowth(p, pmt, r, t, 'compound');
    const simpleData = calculateInterestGrowth(p, pmt, r, t, 'simple');

    // Combine for visualization
    const yearData = compoundData.yearData.map((cd, i) => {
      const sd = simpleData.yearData[i];
      return {
        year: cd.year,
        principal: cd.principal,
        compoundTotal: cd.total,
        simpleTotal: sd.total,
        excess: cd.total - sd.total,
      };
    });

    return {
      yearData,
      summary: {
        principal: compoundData.summary.principal,
        compound: compoundData.summary,
        simple: simpleData.summary,
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
          borderColor: '#6366f1', // Indigo-500
          backgroundColor: '#6366f120',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          label: '單利總額',
          data: data.map((d) => d.simpleTotal),
          borderColor: '#f59e0b', // Amber-500
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0,
          pointRadius: 0,
        },
        {
          label: '投入本金',
          data: data.map((d) => d.principal),
          borderColor: '#94a3b8', // Slate-400
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

<svelte:head>
  <title>單 / 複利計算機 - TradeKit 投資成長與定期定額試算</title>
  <meta
    name="description"
    content="現代化複利計算機，支援定期定額、單筆投入、年化報酬率試算。視覺化呈現單利與複利成長差異，協助您規劃長期投資目標。"
  />
  <meta property="og:title" content="單 / 複利計算機 - TradeKit 投資成長與定期定額試算" />
  <meta
    property="og:description"
    content="現代化複利計算機，支援定期定額、單筆投入、年化報酬率試算。視覺化呈現單利與複利成長差異。"
  />
</svelte:head>

<div class="flex w-full flex-col gap-5" in:fade>
  <!-- Top Section: Inputs & Summary -->
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
    <!-- Calculator Inputs -->
    <div class="lg:col-span-4">
      <div
        class="h-full rounded-2xl border border-slate-200/50 bg-white/80 p-5 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
      >
        <div class="mb-5 flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Calculator class="h-5 w-5" />
          </div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">計算參數</h2>
        </div>

        <div class="space-y-3">
          <DisplayField label="本金 (投資金額初值)" bind:value={initialAmount} />
          <DisplayField label="每月投入金額 (定期定額)" bind:value={monthlyContribution} />
          <DisplayField label="年利率 (%)" bind:value={annualRate} />
          <DisplayField label="年期 (年)" bind:value={years} />
        </div>
      </div>
    </div>

    <!-- Summary, Comparison & Chart View -->
    <div class="flex flex-col gap-5 lg:col-span-8">
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <!-- Main Result Scorecard -->
        <div
          class="rounded-2xl border border-slate-200/50 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400">
              最終概況 <span class={mode === 'compound' ? 'text-indigo-500' : 'text-amber-500'}
                >({mode === 'compound' ? '複利' : '單利'})</span
              >
            </h3>
            <div class="flex gap-1 rounded-lg bg-slate-100/50 p-0.5 dark:bg-slate-800/50">
              <button
                onclick={() => (mode = 'compound')}
                class="rounded-md px-2 py-0.5 text-[10px] font-bold transition-all {mode === 'compound'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">複利</button
              >
              <button
                onclick={() => (mode = 'simple')}
                class="rounded-md px-2 py-0.5 text-[10px] font-bold transition-all {mode === 'simple'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">單利</button
              >
            </div>
          </div>

          <div class="space-y-5">
            <div>
              <div class="mb-0.5 text-[10px] font-medium text-slate-400">預期總金額</div>
              <div
                class="text-2xl font-black tracking-tight {mode === 'compound' ? 'text-indigo-500' : 'text-amber-500'}"
              >
                {formatCurrency(mode === 'compound' ? results.summary.compound.total : results.summary.simple.total)}
                <span class="text-xs font-normal text-slate-400">元</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 dark:border-white/5">
              <div>
                <div class="mb-0.5 text-[10px] font-medium text-slate-400">累計本金</div>
                <div class="text-base font-bold text-slate-800 dark:text-white">
                  {formatCurrency(results.summary.principal)}
                </div>
              </div>
              <div>
                <div class="mb-0.5 text-[10px] font-medium text-slate-400">總報酬率</div>
                <div class="text-base font-bold text-rose-500">
                  {formatPercent(mode === 'compound' ? results.summary.compound.roi : results.summary.simple.roi)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Mini Table -->
        <div
          class="overflow-hidden rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-center text-xs">
              <thead>
                <tr
                  class="bg-slate-50/50 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:bg-slate-800/30"
                >
                  <th class="px-4 py-3 text-left">比較類型</th>
                  <th class="px-4 py-3">預期總額</th>
                  <th class="px-4 py-3 text-right">報酬率</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                <tr class="transition-colors hover:bg-slate-50/30 dark:hover:bg-white/2">
                  <td class="px-4 py-3 text-left font-bold text-indigo-500">複利</td>
                  <td class="px-4 py-3 font-bold text-indigo-500">{formatCurrency(results.summary.compound.total)}</td>
                  <td class="px-4 py-3 text-right font-bold text-rose-500"
                    >{formatPercent(results.summary.compound.roi)}</td
                  >
                </tr>
                <tr class="transition-colors hover:bg-slate-50/30 dark:hover:bg-white/2">
                  <td class="px-4 py-3 text-left font-bold text-amber-500">單利</td>
                  <td class="px-4 py-3 font-bold text-amber-500">{formatCurrency(results.summary.simple.total)}</td>
                  <td class="px-4 py-3 text-right font-bold text-rose-500"
                    >{formatPercent(results.summary.simple.roi)}</td
                  >
                </tr>
                <tr class="bg-slate-50/20 transition-colors dark:bg-white/2">
                  <td class="px-4 py-3 text-left font-medium text-slate-500">本金</td>
                  <td class="px-4 py-3 font-medium text-slate-500">{formatCurrency(results.summary.principal)}</td>
                  <td class="px-4 py-3 text-right font-medium text-slate-400">0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Chart Card (Rectangular Wide Strip) -->
      <div
        class="rounded-2xl border border-slate-200/50 bg-white/80 p-4 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800 dark:text-white">成長趨勢比較</h2>
          <div class="flex items-center gap-3 text-[10px] text-slate-400">
            <div class="flex items-center gap-1">
              <span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> 複利
            </div>
            <div class="flex items-center gap-1">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> 單利
            </div>
            <div class="flex items-center gap-1">
              <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span> 本金
            </div>
          </div>
        </div>

        <div class="relative h-[200px] w-full">
          <canvas bind:this={chartCanvas}></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Detail Table -->
  <div
    class="overflow-hidden rounded-2xl border border-slate-200/50 bg-white/80 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none"
  >
    <div class="border-b border-slate-100 p-5 dark:border-white/5">
      <h3 class="text-base font-bold text-slate-800 dark:text-white">年度詳細數據</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-slate-50/50 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:bg-slate-800/30">
            <th class="px-6 py-3">年度</th>
            <th class="px-6 py-3">累計本金</th>
            <th class="px-6 py-3">單利總額</th>
            <th class="px-6 py-3">複利總額</th>
            <th class="px-6 py-3 text-right">複利超額獲利</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-white/5">
          {#each results.yearData as row (row.year)}
            <tr class="text-xs transition-colors hover:bg-slate-50/30 dark:hover:bg-white/2">
              <td class="px-6 py-3 font-medium text-slate-400">第 {row.year} 年</td>
              <td class="px-6 py-3 font-medium text-slate-700 dark:text-slate-300">{formatCurrency(row.principal)}</td>
              <td class="px-6 py-3 font-medium text-amber-500">{formatCurrency(row.simpleTotal)}</td>
              <td class="px-6 py-3 font-black text-indigo-500">{formatCurrency(row.compoundTotal)}</td>
              <td class="px-6 py-3 text-right font-medium {row.excess >= 0 ? 'text-rose-500' : 'text-emerald-500'}">
                {row.excess >= 0 ? '+' : ''}{formatCurrency(row.excess)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
