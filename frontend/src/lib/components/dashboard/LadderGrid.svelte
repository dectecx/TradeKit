<script lang="ts">
  import { calculator } from '$lib/stores/calculator.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { ListPlus, ArrowDown, ArrowUp } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(num);
  };
</script>

<div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
  <!-- Table Header -->
  <div class="hidden bg-slate-50 px-5 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase md:grid md:grid-cols-[1.2fr_1fr_1fr_1.5fr] dark:bg-slate-800/40">
    <div>目標價位</div>
    <div class="text-center">漲跌幅</div>
    <div class="text-center">跳動檔位</div>
    <div class="text-right">預估損益</div>
  </div>

  <button
    onclick={() => (calculator.ladderRows += 5)}
    class="w-full border-b border-slate-100 bg-white/30 py-3 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-sky-500 dark:border-slate-800 dark:bg-slate-800/20"
  >
    + 展開更多高價位檔次
  </button>

  <div class="divide-y divide-slate-100 dark:divide-slate-800">
    {#each calculator.ladderResult || [] as row}
      <div class={cn(
        "group grid grid-cols-2 items-center px-5 py-4 transition-all hover:bg-slate-50/50 md:grid-cols-[1.2fr_1fr_1fr_1.5fr] dark:hover:bg-slate-800/30",
        row.ticks === 0 ? "bg-sky-50/30 dark:bg-sky-900/10" : ""
      )}>
        <div class="flex flex-col gap-1">
          <button
            onclick={() => {
              calculator.basePrice = row.price.toString();
              calculator.resetLadderRows();
            }}
            class="flex items-center gap-2 text-left group-hover:text-sky-500"
          >
            <span class="text-lg font-black tracking-tighter text-slate-800 dark:text-slate-100">
              {row.price.toFixed(2).replace(/\.?0+$/, '')}
            </span>
            {#if row.percentChange >= settings.targetProfitPercent}
              <span class="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-rose-600/20">停利</span>
            {:else if row.percentChange <= settings.stopLossPercent}
              <span class="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-emerald-600/20">停損</span>
            {/if}
            <ListPlus size={14} class="opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          <div class="md:hidden">
             {#if row.ticks !== 0}
               <span class={cn(
                 "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                 row.ticks > 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
               )}>
                 {row.ticks > 0 ? '+' : ''}{row.ticks} 檔
               </span>
             {:else}
               <span class="rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-bold text-sky-600 dark:bg-sky-900/30">基準價</span>
             {/if}
          </div>
        </div>

        <div class="hidden text-center md:block">
           <div class={cn(
             "text-sm font-black",
             row.percentChange > 0 ? "text-rose-500" : row.percentChange < 0 ? "text-emerald-500" : "text-slate-400"
           )}>
             {row.percentChange > 0 ? '+' : ''}{row.percentChange.toFixed(2)}%
           </div>
        </div>

        <div class="hidden text-center md:block">
          {#if row.ticks !== 0}
            <span class={cn(
              "inline-flex h-6 min-w-[3rem] items-center justify-center rounded-full text-[10px] font-black tracking-widest px-2",
              row.ticks > 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
            )}>
              {row.ticks > 0 ? '+' : ''}{row.ticks}
            </span>
          {:else}
            <span class="text-[10px] font-bold text-sky-500">BASE</span>
          {/if}
        </div>

        <div class={cn(
          "text-right font-sans text-xl font-black tracking-tight md:text-2xl",
          row.profit > 0 ? "text-rose-600" : row.profit < 0 ? "text-emerald-600" : "text-slate-500"
        )}>
          {row.profit > 0 ? '+' : ''}{formatMoney(row.profit)}
        </div>
      </div>
    {/each}
  </div>

  <button
    onclick={() => (calculator.ladderRows += 5)}
    class="w-full bg-white/30 py-4 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-sky-500 dark:bg-slate-800/20"
  >
    + 展開更多低價位檔次
  </button>
</div>
