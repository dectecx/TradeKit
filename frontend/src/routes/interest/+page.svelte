<script lang="ts">
  import Header from '$lib/components/dashboard/Header.svelte';
  import InterestInput from '$lib/components/dashboard/InterestInput.svelte';
  import StatCard from '$lib/components/dashboard/StatCard.svelte';
  import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
  import { t } from '$lib/i18n/index.svelte';
  import { interestStore } from '$lib/stores/interest.svelte';
  import Chart from 'chart.js/auto';
  import { PieChart, Table as TableIcon, TrendingUp } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';

  let isSettingsOpen = $state(false);
  let chartCanvas: HTMLCanvasElement | null = $state(null);
  let chartInstance: Chart | null = null;

  // Chart Update Logic
  $effect(() => {
    if (!chartCanvas || !interestStore.result) return;
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;

    const data = interestStore.result.yearData;
    const labels = data.map((d: any) => t('interest.yearNum', { n: d.year }));

    const chartData = {
      labels,
      datasets: [
        {
          label: t('interest.chartTotal'),
          data: data.map((d: any) => d.total),
          borderColor: '#6366f1',
          backgroundColor: '#6366f120',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
        },
        {
          label: t('interest.chartPrincipal'),
          data: data.map((d: any) => d.principal),
          borderColor: '#94a3b8',
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
          plugins: {
            legend: { display: true, position: 'top', align: 'end' },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleFont: { size: 13, weight: 'bold' },
              padding: 12,
              cornerRadius: 12,
            },
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#e2e8f010' } },
          },
        },
      });
    }
  });

  onMount(() => {
    return () => chartInstance?.destroy();
  });

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(num);
  };
</script>

<svelte:head>
  <title>TradeKit - {t('interest.title')}</title>
</svelte:head>

<div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
  <Header onOpenSettings={() => (isSettingsOpen = true)} showSettings={false} />

  <main class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
    <!-- Left Column -->
    <div class="space-y-6 lg:sticky lg:top-8 lg:col-span-5">
      {#if interestStore.result}
        <div in:slide>
          <StatCard
            title={t('interest.finalTotal')}
            value={formatMoney(interestStore.result.summary.total)}
            subValue={`${t('interest.totalPrincipal')}: ${formatMoney(interestStore.result.summary.principal)}`}
            trend={interestStore.result.summary.roi}
            class="from-indigo-500 to-indigo-600 shadow-indigo-500/20"
          />
        </div>
      {/if}

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
      >
        <h3 class="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">{t('interest.inputParams')}</h3>
        <InterestInput />
      </div>
    </div>

    <!-- Right Column: Chart & Table -->
    <div class="lg:col-span-7">
      {#if interestStore.result}
        <div in:fade class="space-y-6">
          <!-- Chart Card -->
          <div
            class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div class="mb-6 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <PieChart size={18} class="text-indigo-500" />
                <h3 class="text-xs font-bold tracking-widest text-slate-400 uppercase">{t('interest.growthTrend')}</h3>
              </div>
              {t('interest.roi')}: {interestStore.result.summary.roi.toFixed(1)}%
            </div>

            <div class="h-[220px] w-full">
              <canvas bind:this={chartCanvas}></canvas>
            </div>
          </div>

          <!-- Table Card -->
          <div
            class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div class="flex items-center gap-2">
                <TableIcon size={18} class="text-slate-400" />
                <h3 class="text-xs font-bold tracking-widest text-slate-400 uppercase">{t('interest.yearlyTable')}</h3>
              </div>
            </div>
            <div class="max-h-[400px] overflow-y-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-slate-100/30 text-[10px] font-bold text-slate-400 uppercase dark:bg-slate-800/20">
                    <th class="px-6 py-3">{t('interest.year')}</th>
                    <th class="px-6 py-3">{t('interest.totalPrincipal')}</th>
                    <th class="px-6 py-3 text-right">{t('interest.totalValue')}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  {#each interestStore.result.yearData as row}
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td class="px-6 py-4 font-bold text-slate-400">{t('interest.yearNum', { n: row.year })}</td>
                      <td class="px-6 py-4 font-medium text-slate-600 dark:text-slate-300"
                        >{formatMoney(row.principal)}</td
                      >
                      <td class="px-6 py-4 text-right font-black text-indigo-500">{formatMoney(row.total)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-24 text-slate-400">
          <TrendingUp size={48} class="mb-4 opacity-20" />
          <p class="font-bold">{t('interest.empty')}</p>
        </div>
      {/if}
    </div>
  </main>
</div>

{#if isSettingsOpen}
  <SettingsDrawer onClose={() => (isSettingsOpen = false)} />
{/if}
