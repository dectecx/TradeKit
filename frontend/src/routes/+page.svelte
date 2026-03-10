<script lang="ts">
  import CustomNumpad from '$lib/components/CustomNumpad.svelte';
  import DisplayField from '$lib/components/DisplayField.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { calculateTrade, generateTickLadder } from '$lib/utils/finance';
  import { ArrowRightLeft, TrendingDown, TrendingUp, ListEnd } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';

  // ==========================================
  // 1. Svelte 5 狀態管理 ($state 與全域狀態)
  // ==========================================
  type CalcMode = 'single' | 'ladder';
  let calcMode = $state<CalcMode>('ladder');

  // 單點試算模式
  let buyPrice = $state<string>('');
  let sellPrice = $state<string>('');

  // 階梯推演模式
  type TradeDirection = 'long' | 'short';
  let tradeDirection = $state<TradeDirection>('long');
  let basePrice = $state<string>(''); // 單點輸入基準價

  // 共用張數
  let quantity = $state<string>('1');

  // Numpad 焦點追蹤，增加 basePrice
  type InputField = 'buy' | 'sell' | 'quantity' | 'base' | null;
  let activeInput: InputField = $state<InputField>(null);

  // 當切換模式時，清空無關的輸入焦點
  $effect(() => {
    if (calcMode === 'single' && activeInput === 'base') activeInput = null;
    if (calcMode === 'ladder' && (activeInput === 'buy' || activeInput === 'sell')) activeInput = null;
  });

  // ==========================================
  // 2. 全域鍵盤監聽支援 (Desktop Keyboard)
  // ==========================================
  function handleGlobalKeydown(e: KeyboardEvent) {
    if (!activeInput) return;
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
      case 'buy':
        return buyPrice;
      case 'sell':
        return sellPrice;
      case 'base':
        return basePrice;
      case 'quantity':
        return quantity;
      default:
        return '';
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
      case 'buy':
        buyPrice = val;
        break;
      case 'sell':
        sellPrice = val;
        break;
      case 'base':
        basePrice = val;
        break;
      case 'quantity':
        quantity = val;
        break;
    }
  }

  // ==========================================
  // 3. 即時響應式計算 ($derived)
  // ==========================================

  // 單筆試算結果
  let singleTradeResult = $derived.by(() => {
    if (calcMode !== 'single') return null;

    const b = parseFloat(buyPrice);
    const s = parseFloat(sellPrice);
    const q = parseInt(quantity);
    const d = parseFloat(settings.discount) / 10;
    const m = parseInt(settings.minFee);

    if (isNaN(b) || isNaN(s) || isNaN(q) || b <= 0 || s <= 0 || q <= 0 || isNaN(d) || isNaN(m)) return null;

    return calculateTrade(b, s, q, d, m, settings.isDayTrade);
  });

  // 階梯試算結果
  let ladderResult = $derived.by(() => {
    if (calcMode !== 'ladder') return null;

    const b = parseFloat(basePrice);
    const q = parseInt(quantity);
    const d = parseFloat(settings.discount) / 10;
    const m = parseInt(settings.minFee);

    if (isNaN(b) || b <= 0 || isNaN(q) || q <= 0 || isNaN(d) || isNaN(m)) return null;

    return generateTickLadder(b, q, d, m, settings.isDayTrade, tradeDirection, 5, 5);
  });

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(num);
  };
</script>

<!-- 全域鍵盤事件攔截器 -->
<svelte:window onkeydown={handleGlobalKeydown} />

<div class="relative mx-auto w-full max-w-lg pb-24 transition-colors duration-300">
  <!-- Input Section -->
  <div class="relative mb-6 space-y-4 transition-all {activeInput ? 'z-50' : 'z-10'}">
    <!-- Mode Switcher (單筆試算 vs 損益推演) -->
    <div class="flex w-full rounded-2xl bg-white/40 p-1.5 shadow-inner backdrop-blur-md dark:bg-slate-900/40">
      <button
        type="button"
        onclick={() => (calcMode = 'ladder')}
        class="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all {calcMode === 'ladder'
          ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-400'
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
      >
        損益推演
      </button>
      <button
        type="button"
        onclick={() => (calcMode = 'single')}
        class="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all {calcMode === 'single'
          ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-400'
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
      >
        單筆試算
      </button>
    </div>

    <!-- Mode: Single Entry -->
    {#if calcMode === 'single'}
      <div class="relative grid grid-cols-2 gap-3" transition:slide={{ duration: 200 }}>
        <DisplayField
          label="買進價 (Cost)"
          value={buyPrice}
          active={activeInput === 'buy'}
          onClick={() => (activeInput = 'buy')}
        />

        <button
          type="button"
          aria-label="交換買賣價"
          onclick={() => {
            const temp = buyPrice;
            buyPrice = sellPrice;
            sellPrice = temp;
            if (activeInput === 'buy') activeInput = 'sell';
            else if (activeInput === 'sell') activeInput = 'buy';
          }}
          class="absolute top-1/2 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full
          border border-slate-200/50 bg-white/80 text-slate-400 shadow-sm backdrop-blur-md transition-all hover:border-sky-500/30 hover:text-sky-500 active:scale-90
                  dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-500 dark:hover:text-sky-400"
        >
          <ArrowRightLeft class="h-4 w-4" />
        </button>

        <DisplayField
          label="賣出價 (Sell)"
          value={sellPrice}
          active={activeInput === 'sell'}
          onClick={() => (activeInput = 'sell')}
        />
      </div>
    {/if}

    <!-- Mode: Price Ladder -->
    {#if calcMode === 'ladder'}
      <div class="space-y-4" transition:slide={{ duration: 200 }}>
        <!-- 做多做空切換 -->
        <div
          class="flex w-full rounded-2xl border border-slate-200/50 bg-white/60 p-1.5 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-800/40"
        >
          <button
            type="button"
            onclick={() => (tradeDirection = 'long')}
            class="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all {tradeDirection ===
            'long'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400'}"
          >
            <TrendingUp class="h-4 w-4" />
            做多 (先買後賣)
          </button>
          <button
            type="button"
            onclick={() => (tradeDirection = 'short')}
            class="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all {tradeDirection ===
            'short'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400'}"
          >
            <TrendingDown class="h-4 w-4" />
            做空 (先賣後買)
          </button>
        </div>

        <DisplayField
          label="基準價 (Base Price)"
          value={basePrice}
          active={activeInput === 'base'}
          onClick={() => (activeInput = 'base')}
        />
      </div>
    {/if}

    <div class="space-y-3">
      <DisplayField
        label="交易張數 (Qty)"
        value={quantity}
        active={activeInput === 'quantity'}
        onClick={() => (activeInput = 'quantity')}
      />
      <!-- 快速張數選擇器 -->
      <div class="flex items-center gap-2">
        {#each [1, 2, 5, 10] as num}
          <button
            type="button"
            onclick={() => {
              quantity = num.toString();
              if (activeInput === 'quantity') activeInput = null;
            }}
            class="flex-1 rounded-xl border border-slate-200/50 bg-white/60 py-2.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md transition-all hover:border-sky-500/30 hover:text-sky-500 active:scale-95 dark:border-white/5 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:text-sky-400"
          >
            {num} 張
          </button>
        {/each}
      </div>
    </div>

    <!-- Switch / Day Trade Toggle -->
    <div
      class="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-white/60 p-4
            shadow-sm backdrop-blur-md transition-colors dark:border-white/5 dark:bg-slate-800/40"
    >
      <label class="flex cursor-pointer items-center gap-3">
        <div class="relative">
          <input type="checkbox" bind:checked={settings.isDayTrade} class="peer sr-only" />
          <div
            class="peer h-6 w-11 rounded-full bg-slate-300 shadow-inner
						peer-checked:bg-sky-500 peer-focus:outline-none after:absolute after:top-[2px]
						after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border
						after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white
						dark:bg-slate-700 dark:peer-checked:bg-sky-500"
          ></div>
        </div>
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">現股當沖 (稅率減半)</span>
      </label>
    </div>
  </div>

  <!-- Single Entry Results Section -->
  {#if calcMode === 'single' && singleTradeResult}
    <div in:slide={{ duration: 300 }} class="relative z-0 mb-32 space-y-4">
      <!-- Profit Card (遵守台股顏色: 紅漲綠跌) -->
      <div
        class="relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-xl backdrop-blur-xl
				{singleTradeResult.profit >= 0
          ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'}"
      >
        <div class="pointer-events-none absolute -right-4 -bottom-4 opacity-10">
          {#if singleTradeResult.profit >= 0}
            <TrendingUp class="h-36 w-36" strokeWidth={3} />
          {:else}
            <TrendingDown class="h-36 w-36" strokeWidth={3} />
          {/if}
        </div>

        <h2 class="mb-1 text-sm font-medium opacity-90">淨損益 (Net Profit)</h2>
        <div class="mb-5 font-sans text-[2.75rem] leading-none font-black tracking-tight drop-shadow-sm">
          {formatMoney(singleTradeResult.profit)}
        </div>

        <div class="my-4 h-px w-full bg-white/20"></div>

        <div class="grid grid-cols-2 gap-4 text-sm font-medium">
          <div>
            <p class="relative z-10 opacity-75">總成本 (Cost)</p>
            <p class="relative z-10 text-lg font-bold tracking-tight">{formatMoney(singleTradeResult.totalCost)}</p>
          </div>
          <div>
            <p class="relative z-10 opacity-75">實收 (Revenue)</p>
            <p class="relative z-10 text-lg font-bold tracking-tight">{formatMoney(singleTradeResult.netRevenue)}</p>
          </div>
        </div>
      </div>

      <!-- Fees & Taxes Detail Breakdown -->
      <div
        class="rounded-2xl border border-slate-200/50 bg-white/60 p-5
                shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-800/60"
      >
        <h3 class="mb-4 text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-300">交易成本明細</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500 dark:text-slate-400">買進手續費 (折數 {settings.discount})</span>
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-200"
              >{formatMoney(singleTradeResult.buyFee)}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500 dark:text-slate-400">賣出手續費 (折數 {settings.discount})</span>
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-200"
              >{formatMoney(singleTradeResult.sellFee)}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500 dark:text-slate-400">
              交易稅 (
              {#if settings.isDayTrade}
                <span class="font-semibold text-orange-500 dark:text-orange-400">當沖 0.15%</span>
              {:else}
                一般 0.3%
              {/if}
              )
            </span>
            <span class="text-sm font-semibold text-sky-600 dark:text-sky-400"
              >{formatMoney(singleTradeResult.sellTax)}</span
            >
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Ladder Mode Results Section -->
  {#if calcMode === 'ladder' && ladderResult}
    <div in:slide={{ duration: 300 }} class="relative z-0 mb-32 space-y-4">
      <div
        class="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
      >
        <!-- 表格 Header -->
        <div
          class="grid grid-cols-3 bg-slate-100/50 px-5 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase dark:bg-slate-800/50 dark:text-slate-400"
        >
          <div class="text-left">目標價位</div>
          <div class="text-center">跳動檔位</div>
          <div class="text-right">預估損益</div>
        </div>

        <!-- 表格 Body -->
        <div class="flex flex-col">
          {#each ladderResult as row}
            <div
              class="grid grid-cols-3 items-center border-t border-slate-100 px-5 py-3 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-slate-800/30
              {row.ticks === 0 ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''}"
            >
              <!-- 價位 -->
              <div class="text-left font-sans text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {row.price.toFixed(2).replace(/\.?0+$/, '')}
              </div>

              <!-- 檔位 (Ticks) -->
              <div class="text-center">
                {#if row.ticks > 0}
                  <span
                    class="inline-flex h-6 w-12 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                  >
                    +{row.ticks}
                  </span>
                {:else if row.ticks < 0}
                  <span
                    class="inline-flex h-6 w-12 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  >
                    {row.ticks}
                  </span>
                {:else}
                  <span
                    class="inline-flex items-center justify-center rounded-sm bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
                  >
                    基準價
                  </span>
                {/if}
              </div>

              <!-- 預估損益 (Profit) -->
              <div
                class="text-right font-sans text-lg font-black tracking-tight
                {row.profit > 0
                  ? 'text-rose-500 dark:text-rose-400'
                  : row.profit < 0
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'}"
              >
                {row.profit > 0 ? '+' : ''}{formatMoney(row.profit)}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 提示訊息框 -->
      <div
        class="rounded-2xl border border-sky-200/50 bg-sky-50/50 p-4 text-sm text-sky-700 dark:border-sky-500/20 dark:bg-sky-900/20 dark:text-sky-300"
      >
        <p class="flex items-center gap-2 font-medium">
          <ListEnd class="h-4 w-4" />
          損益推演表說明
        </p>
        <p class="mt-1 opacity-80">
          此表依照台灣股市跳動單位規則，向上向下自動推算出共 11 個檔位的漲跌損益（已扣除券商手續費與證交稅）。
        </p>
      </div>
    </div>
  {/if}

  <!-- Custom Numpad Drawer overlay & component -->
  {#if activeInput}
    <!-- 行動版與桌機版共用的隱形遮罩 (點外側可取消焦點) -->
    <!-- 桌機版為全透明，行動版則有毛玻璃黑幕 -->
    <button
      onclick={() => (activeInput = null)}
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
      class="fixed inset-0 z-40 h-full w-full cursor-default bg-slate-900/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none dark:bg-black/60"
      aria-label="關閉鍵盤"
    ></button>

    <!-- 桌機版隱藏 Numpad，完全運用實體鍵盤 -->
    <div class="relative z-50 md:hidden">
      <CustomNumpad value={currentInputValue} onInput={handleNumpadUpdate} onClose={() => (activeInput = null)} />
    </div>
  {/if}
</div>
