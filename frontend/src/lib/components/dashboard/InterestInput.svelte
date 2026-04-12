<script lang="ts">
  import { interestStore } from '$lib/stores/interest.svelte';
  import { t } from '$lib/i18n/index.svelte';
  import { cn } from '$lib/utils';
</script>

<div class="space-y-5">
  <div class="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
    <button
      onclick={() => (interestStore.mode = 'compound')}
      class={cn(
        "flex-1 rounded-xl py-2 text-sm font-bold transition-all",
        interestStore.mode === 'compound' 
          ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400" 
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
      )}
    >
      {t('interest.compound')}
    </button>
    <button
      onclick={() => (interestStore.mode = 'simple')}
      class={cn(
        "flex-1 rounded-xl py-2 text-sm font-bold transition-all",
        interestStore.mode === 'simple' 
          ? "bg-white text-amber-600 shadow-sm dark:bg-slate-800 dark:text-amber-400" 
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
      )}
    >
      {t('interest.simple')}
    </button>
  </div>

  <div class="space-y-4">
    <div class="space-y-2">
      <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{t('interest.principal')}</label>
      <input 
        bind:value={interestStore.initialAmountStr} 
        placeholder="0"
        class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
      />
    </div>
    <div class="space-y-2">
      <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{t('interest.monthly')}</label>
      <input 
        bind:value={interestStore.monthlyContributionStr} 
        placeholder="0"
        class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
      />
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{t('interest.annualRate')}</label>
        <input 
          bind:value={interestStore.annualRateStr} 
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
        />
      </div>
      <div class="space-y-2">
        <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{t('interest.years')}</label>
        <input 
          bind:value={interestStore.yearsStr} 
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
        />
      </div>
    </div>
  </div>
</div>
