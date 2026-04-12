<script lang="ts">
  import { dividendStore } from '$lib/stores/dividend.svelte';
  import Header from '$lib/components/dashboard/Header.svelte';
  import StatCard from '$lib/components/dashboard/StatCard.svelte';
  import DividendInput from '$lib/components/dashboard/DividendInput.svelte';
  import CustomNumpad from '$lib/components/CustomNumpad.svelte';
  import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
  import { Calculator, Info } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import Decimal from 'decimal.js';

  let isSettingsOpen = $state(false);
  let activeInput = $state<'price' | 'cash' | 'stock' | null>(null);

  function handleInput(value: string) {
    if (activeInput === 'price') dividendStore.priceStr = value;
    if (activeInput === 'cash') dividendStore.cashDivStr = value;
    if (activeInput === 'stock') dividendStore.stockDivStr = value;
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
  <title>TradeKit - 除權息計算</title>
</svelte:head>

<div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
  <Header onOpenSettings={() => isSettingsOpen = true} />

  <main class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
    <!-- Left Column -->
    <div class="space-y-6 lg:col-span-5 lg:sticky lg:top-8">
      
      {#if dividendStore.exDivPrice > 0}
        <div in:slide>
          <StatCard 
            title="除權息後參考價" 
            value={dividendStore.exDivPrice.toString()} 
            subValue={`原始股價: ${dividendStore.priceStr}`}
            trend={0} 
            class="from-sky-500 to-sky-600 shadow-sky-500/20"
          />
        </div>
      {/if}

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h3 class="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">範疇輸入</h3>
        <DividendInput onFocusInput={(f) => activeInput = f} />
      </div>
    </div>

    <!-- Right Column: Formulas & Details -->
    <div class="lg:col-span-7">
      {#if dividendStore.showFormulas}
        <div in:fade class="space-y-6">
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <div class="mb-6 flex items-center gap-2">
              <Calculator size={18} class="text-sky-500" />
              <h3 class="text-xs font-bold tracking-widest text-slate-400 uppercase">計算過程推演</h3>
            </div>

            {#if dividendStore.stockDiv > 0 && dividendStore.cashDiv > 0}
              <div class="space-y-8">
                <div>
                  <p class="mb-3 text-xs font-bold text-slate-400">STEP 1. 除息計算 (扣除現金)</p>
                  <div class="flex items-center gap-4 text-xl font-black md:text-2xl">
                    <span>{dividendStore.price}</span>
                    <span class="text-slate-300">-</span>
                    <span>{dividendStore.cashDiv}</span>
                    <span class="text-slate-300">=</span>
                    <span class="text-sky-500">{Number(new Decimal(dividendStore.price).minus(dividendStore.cashDiv).toDecimalPlaces(4))}</span>
                  </div>
                </div>

                <div class="h-px bg-slate-100 dark:bg-slate-800"></div>

                <div>
                  <p class="mb-3 text-xs font-bold text-slate-400">STEP 2. 除權計算 (股數稀釋)</p>
                  <div class="flex items-center gap-4 text-xl font-black md:text-2xl">
                    <div class="flex flex-col items-center">
                      <span class="border-b-2 border-slate-200 pb-1 px-4 dark:border-slate-700">{Number(new Decimal(dividendStore.price).minus(dividendStore.cashDiv).toDecimalPlaces(4))}</span>
                      <span class="pt-1 text-sm text-slate-400">1 + ({dividendStore.stockDiv} / 10)</span>
                    </div>
                    <span class="text-slate-300">=</span>
                    <span class="text-sky-500 text-3xl md:text-4xl">{dividendStore.exDivPrice}</span>
                  </div>
                </div>
              </div>
            {:else if dividendStore.cashDiv > 0}
               <div class="flex items-center gap-4 text-2xl font-black md:text-3xl">
                  <span>{dividendStore.price}</span>
                  <span class="text-slate-300">-</span>
                  <span>{dividendStore.cashDiv}</span>
                  <span class="text-slate-300">=</span>
                  <span class="text-sky-500">{dividendStore.exDivPrice}</span>
               </div>
            {:else if dividendStore.stockDiv > 0}
               <div class="flex items-center gap-4 text-2xl font-black md:text-3xl">
                  <div class="flex flex-col items-center">
                    <span class="border-b-2 border-slate-200 pb-1 px-4 dark:border-slate-700">{dividendStore.price}</span>
                    <span class="pt-1 text-sm text-slate-400">1 + ({dividendStore.stockDiv} / 10)</span>
                  </div>
                  <span class="text-slate-300">=</span>
                  <span class="text-sky-500">{dividendStore.exDivPrice}</span>
               </div>
            {/if}
          </div>

          <div class="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-sky-700 dark:border-sky-900/30 dark:bg-sky-900/20 dark:text-sky-300">
             <div class="flex items-center gap-2 font-bold mb-1">
               <Info size={14} />
               <span>台股除權息規則</span>
             </div>
             <p class="opacity-80">除權息參考價計算公式：(除權息前股價 - 現金股利) / (1 + 股票股利 / 10)</p>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-24 text-slate-400">
           <Calculator size={48} class="mb-4 opacity-20" />
           <p class="font-bold">請輸入股價與股利資訊</p>
        </div>
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
    <CustomNumpad value={activeInput === 'price' ? dividendStore.priceStr : activeInput === 'cash' ? dividendStore.cashDivStr : dividendStore.stockDivStr} onInput={handleInput} onClose={() => (activeInput = null)} />
  </div>
{/if}

{#if isSettingsOpen}
  <SettingsDrawer onClose={() => (isSettingsOpen = false)} />
{/if}
