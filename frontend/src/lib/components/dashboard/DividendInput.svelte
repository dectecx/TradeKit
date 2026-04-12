<script lang="ts">
  import { dividendStore } from '$lib/stores/dividend.svelte';
  import { t } from '$lib/i18n/index.svelte';
  import { cn } from '$lib/utils';

  let { onFocusInput } = $props<{ onFocusInput: (field: any) => void }>();
</script>

<div class="space-y-5">
  <div class="space-y-2">
    <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{t('dividend.prePrice')}</label>
    <input 
      bind:value={dividendStore.priceStr} 
      onfocus={() => onFocusInput('price')}
      placeholder="0.00"
      class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
    />
  </div>

  <div class="grid grid-cols-2 gap-3">
    <div class="space-y-2">
      <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{t('dividend.cashDiv')}</label>
      <input 
        bind:value={dividendStore.cashDivStr} 
        onfocus={() => onFocusInput('cash')}
        placeholder="0.00"
        class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
      />
    </div>
    <div class="space-y-2">
      <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{t('dividend.stockDiv')}</label>
      <input 
        bind:value={dividendStore.stockDivStr} 
        onfocus={() => onFocusInput('stock')}
        placeholder="0.00"
        class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-black focus:border-sky-500 focus:ring-0 dark:border-slate-800 dark:bg-slate-900"
      />
    </div>
  </div>
</div>
