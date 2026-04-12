<script lang="ts">
  import { calculator } from '$lib/stores/calculator.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { ArrowRightLeft, TrendingDown, TrendingUp, Hash } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let { onFocusInput } = $props<{ onFocusInput: (field: any) => void }>();

  function swapPrice() {
    const temp = calculator.buyPrice;
    calculator.buyPrice = calculator.sellPrice;
    calculator.sellPrice = temp;
  }
</script>

<div class="space-y-6">
  <!-- Mode Switcher -->
  <div class="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
    <button
      onclick={() => (calculator.calcMode = 'ladder')}
      class={cn(
        "flex-1 rounded-xl py-2 text-sm font-bold transition-all",
        calculator.calcMode === 'ladder' 
          ? "bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-400" 
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
      )}
    >
      損益推演
    </button>
    <button
      onclick={() => (calculator.calcMode = 'single')}
      class={cn(
        "flex-1 rounded-xl py-2 text-sm font-bold transition-all",
        calculator.calcMode === 'single' 
          ? "bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-400" 
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
      )}
    >
      單筆試算
    </button>
  </div>

  {#if calculator.calcMode === 'ladder'}
    <div class="grid grid-cols-2 gap-2">
      <button
        onclick={() => (calculator.tradeDirection = 'long')}
        class={cn(
          "flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold border transition-all",
          calculator.tradeDirection === 'long'
            ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20"
            : "bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
        )}
      >
        <TrendingUp size={16} /> 做多
      </button>
      <button
        onclick={() => (calculator.tradeDirection = 'short')}
        class={cn(
          "flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold border transition-all",
          calculator.tradeDirection === 'short'
            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
        )}
      >
        <TrendingDown size={16} /> 做空
      </button>
    </div>
  {/if}

  <div class="space-y-4">
    {#if calculator.calcMode === 'single'}
      <div class="relative grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">買進價</label>
          <input 
            bind:value={calculator.buyPrice} 
            onfocus={() => onFocusInput('buy')}
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">賣出價</label>
          <input 
            bind:value={calculator.sellPrice} 
            onfocus={() => onFocusInput('sell')}
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        <button 
          onclick={swapPrice}
          class="absolute top-1/2 left-1/2 -ml-5 mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <ArrowRightLeft size={16} />
        </button>
      </div>
    {:else}
      <div class="space-y-2">
        <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">基準價 (Base Price)</label>
        <input 
          bind:value={calculator.basePrice} 
          onfocus={() => onFocusInput('base')}
          placeholder="0.00"
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-2xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
        />
      </div>
    {/if}

    <div class="space-y-2">
      <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">交易張數 (Qty)</label>
      <div class="flex gap-2">
        <input 
          bind:value={calculator.quantity} 
          onfocus={() => onFocusInput('quantity')}
          class="w-24 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
        />
        <div class="grid flex-1 grid-cols-4 gap-2">
          {#each [1, 2, 5, 10] as n}
            <button 
              onclick={() => (calculator.quantity = n.toString())}
              class="rounded-xl border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {n}張
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Day Trade Toggle -->
  <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 dark:bg-orange-900/30">
        <Hash size={20} />
      </div>
      <div>
        <p class="text-sm font-bold">現股當沖</p>
        <p class="text-[10px] text-slate-400">{settings.isDayTrade ? '稅率 0.15%' : '稅率 0.3%'}</p>
      </div>
    </div>
    <button 
      onclick={() => (settings.isDayTrade = !settings.isDayTrade)}
      class={cn(
        "relative h-6 w-12 rounded-full transition-colors",
        settings.isDayTrade ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
      )}
    >
      <div class={cn(
        "absolute top-1 h-4 w-4 rounded-full bg-white transition-all",
        settings.isDayTrade ? "right-1" : "left-1"
      )}></div>
    </button>
  </div>
</div>
