<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { Settings, Share2 } from 'lucide-svelte';

  let { onOpenSettings, showSettings = false } = $props<{ onOpenSettings: () => void, showSettings?: boolean }>();
</script>

<header class="mb-8 flex items-center justify-between px-2">
  <div class="flex items-center gap-3">
    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 p-0.5 shadow-lg shadow-sky-500/20">
      <div class="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-slate-900">
        <span class="bg-gradient-to-tr from-sky-600 to-sky-400 bg-clip-text text-2xl font-black text-transparent">T</span>
      </div>
    </div>
    <div>
      <h1 class="text-xl font-black tracking-tight text-slate-800 dark:text-white">TradeKit</h1>
      <p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Pro Trading Calc</p>
    </div>
  </div>

  <div class="flex items-center gap-2">
    {#if showSettings}
      <div class="mr-2 hidden items-end flex-col text-right md:flex">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">當前設定</span>
        <span class="text-xs font-black text-sky-600 dark:text-sky-400">
          {settings.discount}折 / {settings.minFee}元
        </span>
      </div>
      <button 
        onclick={onOpenSettings}
        aria-label="打開交易設定"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-sky-900/30 dark:hover:text-sky-400"
      >
        <Settings size={20} />
      </button>
    {/if}

    <button aria-label="分享" class="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
      <Share2 size={20} />
    </button>
  </div>
</header>
