<script lang="ts">
  import CustomNumpad from '$lib/components/CustomNumpad.svelte';
  import DisplayField from '$lib/components/DisplayField.svelte';
  import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { calculateTrade } from '$lib/utils/finance';
  import { ArrowRightLeft, Calculator, Moon, Settings, Sun, TrendingDown, TrendingUp } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';

  // ==========================================
  // 1. Svelte 5 狀態管理 ($state 與全域狀態)
  // ==========================================
  let buyPrice = $state<string>('');
  let sellPrice = $state<string>('');
  let quantity = $state<string>('1');

  type InputField = 'buy' | 'sell' | 'quantity' | null;
  let activeInput: InputField = $state<InputField>(null);

  // 控制設定面板的開關
  let isSettingsOpen = $state<boolean>(false);

  // ==========================================
  // 2. 主題切換邏輯
  // ==========================================
  function toggleTheme() {
    settings.isDarkMode = !settings.isDarkMode;
  }

  // ==========================================
  // 3. 全域鍵盤監聽支援 (Desktop Keyboard)
  // ==========================================
  function handleGlobalKeydown(e: KeyboardEvent) {
    // 若設定面板開啟，或沒有鎖定輸入框時不攔截
    if (isSettingsOpen || !activeInput) return;

    const key = e.key;

    // 允許輸入 0-9 或是小數點
    if (/^[0-9\.]$/.test(key)) {
      e.preventDefault();
      handleNumpadUpdate(key);
    } else if (key === 'Backspace') {
      e.preventDefault();
      handleNumpadUpdate('clear');
    } else if (key === 'Enter' || key === 'Escape') {
      e.preventDefault();
      activeInput = null; // 取消焦點
    }
  }

  let currentInputValue = $derived.by(() => {
    switch (activeInput) {
      case 'buy':
        return buyPrice;
      case 'sell':
        return sellPrice;
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
      // 防止輸入多個小數點
      return;
    } else if (key === '.' && val === '') {
      // 限制首位數為小數點時自動補零
      val = '0.';
    } else if (key === '0' && val === '0') {
      // 防止輸入多個無意義的 0
      return;
    } else if (val === '0' && key !== '.') {
      // 如果當前只有 '0'，且輸入的不是小數點，則將其取代 (例如 0 -> 5)
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
      case 'quantity':
        quantity = val;
        break;
    }
  }

  // ==========================================
  // 4. 即時響應式計算 ($derived)
  // ==========================================
  let tradeResult = $derived.by(() => {
    const b = parseFloat(buyPrice);
    const s = parseFloat(sellPrice);
    const q = parseInt(quantity);

    // 由於現在折數採 0~10 的表示法，須除以 10 送入核心計算引擎
    const d = parseFloat(settings.discount) / 10;
    const m = parseInt(settings.minFee);

    if (isNaN(b) || isNaN(s) || isNaN(q) || b <= 0 || s <= 0 || q <= 0 || isNaN(d) || isNaN(m)) return null;

    return calculateTrade(b, s, q, d, m, settings.isDayTrade);
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

<div class="relative mx-auto min-h-screen max-w-md p-4 pb-24 transition-colors duration-300">
  <!-- Header -->
  <header class="mb-6 flex items-center justify-between pt-2">
    <div class="flex items-center gap-2">
      <Calculator class="text-primary-500 h-6 w-6" />
      <h1 class="text-2xl font-bold tracking-tight dark:text-white">TradeKit</h1>
    </div>

    <button
      onclick={toggleTheme}
      class="rounded-full bg-slate-200/50 p-2 text-slate-600 transition-colors hover:bg-slate-300/50 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/50"
      aria-label="切換深淺色模式"
    >
      {#if settings.isDarkMode}
        <Sun class="h-5 w-5" />
      {:else}
        <Moon class="h-5 w-5" />
      {/if}
    </button>
  </header>

  <!-- Input Section -->
  <div class="relative mb-6 space-y-4 transition-all {activeInput ? 'z-50' : 'z-10'}">
    <!-- 買賣雙欄位排版 -->
    <div class="relative grid grid-cols-2 gap-3">
      <DisplayField
        label="買進價 (Cost)"
        value={buyPrice}
        active={activeInput === 'buy'}
        onClick={() => (activeInput = 'buy')}
      />

      <div
        class="absolute top-1/2 left-1/2 z-10 flex h-10
				w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full
				border border-slate-200/50 bg-white/80 text-slate-400 shadow-sm backdrop-blur-md
                dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-500"
      >
        <ArrowRightLeft class="h-4 w-4" />
      </div>

      <DisplayField
        label="賣出價 (Sell)"
        value={sellPrice}
        active={activeInput === 'sell'}
        onClick={() => (activeInput = 'sell')}
      />
    </div>

    <DisplayField
      label="交易張數 (Qty)"
      value={quantity}
      active={activeInput === 'quantity'}
      onClick={() => (activeInput = 'quantity')}
    />

    <!-- Switch & Settings row -->
    <div
      class="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-white/60 p-4
            shadow-sm backdrop-blur-md transition-colors dark:border-white/5 dark:bg-slate-800/40"
    >
      <label class="flex cursor-pointer items-center gap-3">
        <div class="relative">
          <input type="checkbox" bind:checked={settings.isDayTrade} class="peer sr-only" />
          <div
            class="peer peer-checked:bg-primary-500 h-6 w-11 rounded-full bg-slate-300 shadow-inner
						peer-focus:outline-none after:absolute after:top-[2px]
						after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border
						after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full
						peer-checked:after:border-white dark:bg-slate-700"
          ></div>
        </div>
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">現股當沖 (稅率減半)</span>
      </label>
      <button
        onclick={() => (isSettingsOpen = true)}
        class="rounded-full bg-slate-100 p-2 text-slate-400 transition-all hover:text-slate-700 active:scale-95 dark:bg-slate-700/50 dark:hover:text-slate-200"
        aria-label="開啟設定面板"
      >
        <Settings class="h-5 w-5" />
      </button>
    </div>
  </div>

  <!-- Results Section -->
  {#if tradeResult}
    <div in:slide={{ duration: 300 }} class="relative z-0 mb-32 space-y-4">
      <!-- Profit Card (遵守台股顏色: 紅漲綠跌) -->
      <div
        class="relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-xl backdrop-blur-xl
				{tradeResult.profit >= 0
          ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'}"
      >
        <div class="pointer-events-none absolute -right-4 -bottom-4 opacity-10">
          {#if tradeResult.profit >= 0}
            <TrendingUp class="h-36 w-36" strokeWidth={3} />
          {:else}
            <TrendingDown class="h-36 w-36" strokeWidth={3} />
          {/if}
        </div>

        <h2 class="mb-1 text-sm font-medium opacity-90">淨損益 (Net Profit)</h2>
        <div class="mb-5 font-sans text-[2.75rem] leading-none font-black tracking-tight drop-shadow-sm">
          {formatMoney(tradeResult.profit)}
        </div>

        <div class="my-4 h-px w-full bg-white/20"></div>

        <div class="grid grid-cols-2 gap-4 text-sm font-medium">
          <div>
            <p class="relative z-10 opacity-75">總成本 (Cost)</p>
            <p class="relative z-10 text-lg font-bold tracking-tight">{formatMoney(tradeResult.totalCost)}</p>
          </div>
          <div>
            <p class="relative z-10 opacity-75">實收 (Revenue)</p>
            <p class="relative z-10 text-lg font-bold tracking-tight">{formatMoney(tradeResult.netRevenue)}</p>
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
            <span class="text-sm text-slate-500 dark:text-slate-300">買進手續費 (折數 {settings.discount})</span>
            <span class="text-sm font-semibold dark:text-slate-100">{formatMoney(tradeResult.buyFee)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500 dark:text-slate-300">賣出手續費 (折數 {settings.discount})</span>
            <span class="text-sm font-semibold dark:text-slate-100">{formatMoney(tradeResult.sellFee)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500 dark:text-slate-300"
              >交易稅 ({settings.isDayTrade ? '當沖 0.15%' : '一般 0.3%'})</span
            >
            <span class="text-primary-600 dark:text-primary-400 text-sm font-semibold"
              >{formatMoney(tradeResult.sellTax)}</span
            >
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- 設定面板 Drawer Overlay -->
  {#if isSettingsOpen}
    <SettingsDrawer onClose={() => (isSettingsOpen = false)} />
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
