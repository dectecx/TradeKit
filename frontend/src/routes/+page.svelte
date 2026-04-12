<script lang="ts">
  import { calculator } from '$lib/stores/calculator.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import Header from '$lib/components/dashboard/Header.svelte';
  import StatCard from '$lib/components/dashboard/StatCard.svelte';
  import TradeInput from '$lib/components/dashboard/TradeInput.svelte';
  import LadderGrid from '$lib/components/dashboard/LadderGrid.svelte';
  import CustomNumpad from '$lib/components/CustomNumpad.svelte';
  import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
  import { ListEnd } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';

  let isSettingsOpen = $state(false);
  
  type InputField = 'buy' | 'sell' | 'quantity' | 'base' | null;
  let activeInput = $state<InputField>(null);

  // Keyboard Handlers
  function handleGlobalKeydown(e: KeyboardEvent) {
    if (!activeInput) return;
    if (document.activeElement?.tagName === 'INPUT') return;
    const key = e.key;
    if (/^[0-9\.]$/.test(key)) {
      e.preventDefault();
      handleNumpadUpdate(key);
    } else if (key === 'Backspace') {
      e.preventDefault();
      handleNumpadUpdate('clear');
    } else if (key === 'Enter' || key === 'Escape') {
      e.preventDefault();
      activeInput = null;
    }
  }

  let currentInputValue = $derived.by(() => {
    switch (activeInput) {
      case 'buy': return calculator.buyPrice;
      case 'sell': return calculator.sellPrice;
      case 'base': return calculator.basePrice;
      case 'quantity': return calculator.quantity;
      default: return '';
    }
  });

  function handleNumpadUpdate(key: string) {
    let val = currentInputValue;
    if (key === 'clear') {
      val = val.slice(0, -1);
    } else if (key === '.' && val.includes('.')) {
      return;
    } else if (key === '.' && val === '') {
      val = '0.';
    } else if (key === '0' && val === '0') {
      return;
    } else if (val === '0' && key !== '.') {
      val = key;
    } else {
      val += key;
    }

    switch (activeInput) {
      case 'buy': calculator.buyPrice = val; break;
      case 'sell': calculator.sellPrice = val; break;
      case 'base': calculator.basePrice = val; break;
      case 'quantity': calculator.quantity = val; break;
    }
  }

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(num);
  };
</script>

<svelte:head>
  <title>TradeKit - 台股儀表板</title>
</svelte:head>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
  <Header onOpenSettings={() => (isSettingsOpen = true)} />

  <main class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
    <!-- Left Column: Inputs & Stats -->
    <div class="space-y-6 lg:col-span-5 lg:sticky lg:top-8">
      
      <!-- Quick Stats Card -->
      {#if calculator.calcMode === 'single' && calculator.singleResult}
        <div in:slide>
          <StatCard 
            title="預估淨損益" 
            value={formatMoney(calculator.singleResult.profit)} 
            subValue={`總成本: ${formatMoney(calculator.singleResult.totalCost)} / 實收: ${formatMoney(calculator.singleResult.netRevenue)}`}
            trend={calculator.singleResult.profit}
          />
        </div>
      {:else if calculator.calcMode === 'ladder' && calculator.ladderResult}
        <!-- In ladder mode, we can show a summary of the base price profit or something else -->
        {@const baseRow = calculator.ladderResult.find(r => r.ticks === 0)}
        <div in:slide>
          <StatCard 
            title="基準價位損益" 
            value={baseRow ? formatMoney(baseRow.profit) : '$0'} 
            subValue={`交易張數: ${calculator.quantity} 張 / 手續費已折讓`}
            trend={baseRow?.profit || 0}
          />
        </div>
      {/if}

      <!-- Input Card -->
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <TradeInput onFocusInput={(f) => activeInput = f} />
      </div>

    </div>

    <!-- Right Column: Detailed Results -->
    <div class="lg:col-span-7">
      {#if calculator.calcMode === 'ladder'}
        {#if calculator.ladderResult}
           <div in:fade>
             <LadderGrid />
           </div>
        {:else}
           <div class="flex flex-col items-center justify-center py-24 text-slate-400">
             <ListEnd size={48} class="mb-4 opacity-20" />
             <p class="font-bold">等待基準價輸入...</p>
           </div>
        {/if}
      {:else if calculator.calcMode === 'single'}
         {#if calculator.singleResult}
           <div class="space-y-4" in:fade>
              <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                <h3 class="mb-6 text-xs font-bold tracking-widest text-slate-400 uppercase">交易成本細項</h3>
                <div class="space-y-4">
                  <div class="flex justify-between border-b border-slate-50 pb-4 dark:border-slate-800">
                    <span class="text-slate-500">買進手續費</span>
                    <span class="font-black">{formatMoney(calculator.singleResult.buyFee)}</span>
                  </div>
                  <div class="flex justify-between border-b border-slate-50 pb-4 dark:border-slate-800">
                    <span class="text-slate-500">賣出手續費</span>
                    <span class="font-black">{formatMoney(calculator.singleResult.sellFee)}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">證券交易稅</span>
                    <span class="font-black text-sky-500">{formatMoney(calculator.singleResult.sellTax)}</span>
                  </div>
                </div>
              </div>
           </div>
         {:else}
           <div class="flex flex-col items-center justify-center py-24 text-slate-400">
             <ListEnd size={48} class="mb-4 opacity-20" />
             <p class="font-bold">請輸入買賣價格進行試算</p>
           </div>
         {/if}
      {/if}
    </div>
  </main>
</div>

<!-- Overlays -->
{#if activeInput}
  <button
    aria-label="關閉輸入面板"
    onclick={() => (activeInput = null)}
    class="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm md:hidden"
  ></button>
  <div class="fixed right-0 bottom-0 left-0 z-50 md:hidden">
    <CustomNumpad value={currentInputValue} onInput={handleNumpadUpdate} onClose={() => (activeInput = null)} />
  </div>
{/if}

{#if isSettingsOpen}
  <SettingsDrawer onClose={() => (isSettingsOpen = false)} />
{/if}

<style>
  @reference "tailwindcss";

  :global(body) {
    @apply bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased;
  }
</style>
