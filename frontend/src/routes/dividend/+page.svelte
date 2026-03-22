<script lang="ts">
  import CustomNumpad from '$lib/components/CustomNumpad.svelte';
  import DisplayField from '$lib/components/DisplayField.svelte';
  import { getExDividendPrice } from '$lib/utils/finance';
  import Decimal from 'decimal.js';
  import { slide } from 'svelte/transition';

  // Input states
  let activeInput: 'price' | 'cash' | 'stock' | null = $state(null);
  let priceStr: string = $state('');
  let cashDivStr: string = $state('');
  let stockDivStr: string = $state('');

  // Derived numeric representations
  let price = $derived(Number(priceStr) || 0);
  let cashDiv = $derived(Number(cashDivStr) || 0);
  let stockDiv = $derived(Number(stockDivStr) || 0);

  // Math Calculations (driven by TDD rules in finance.ts)
  let exDivPrice = $derived(getExDividendPrice(price, cashDiv, stockDiv));

  // Determine which formulas to show
  let showFormulas = $derived(price > 0 && (cashDiv > 0 || stockDiv > 0));

  // Component logic (activeInput is only needed for mobile Numpad)
  function handleInput(value: string) {
    if (activeInput === 'price') priceStr = value;
    if (activeInput === 'cash') cashDivStr = value;
    if (activeInput === 'stock') stockDivStr = value;
  }

  function handleCloseNumpad() {
    activeInput = null;
  }
</script>

<svelte:head>
  <title>除權息計算機 - TradeKit 配股配息參考價試算</title>
  <meta
    name="description"
    content="輕鬆精算台股除權息後的預估參考價。支援現金股利（配息）與股票股利（配股）合併計算，並提供詳細計算公式與推演過程。"
  />
  <meta property="og:title" content="除權息計算機 - TradeKit 配股配息參考價試算" />
  <meta
    property="og:description"
    content="輕鬆精算台股除權息後的預估參考價。支援現金股利（配息）與股票股利（配股）合併計算。"
  />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "TradeKit 除權息計算機",
      "operatingSystem": "Web",
      "applicationCategory": "FinanceApplication",
      "description": "計算台股除權息後的預估參考價，支援配股與配息同時試算。",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TWD"
      }
    }
  </script>
</svelte:head>

<div class="flex min-h-[calc(100vh-8rem)] flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
  <!-- Left Column: Input Form -->
  <div class="flex w-full flex-col gap-6 lg:w-[45%] xl:w-[40%]">
    <div
      class="rounded-3xl border border-slate-200/50 bg-white/60 p-5 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-slate-900/60"
    >
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold tracking-tight text-slate-800 dark:text-white">基準輸入</h2>
      </div>

      <div class="space-y-5">
        <DisplayField
          label="除權息前股價"
          bind:value={priceStr}
          onFocus={() => (activeInput = 'price')}
          onBlur={() => (activeInput = null)}
        />
        <DisplayField
          label="現金股利 (配息)"
          bind:value={cashDivStr}
          onFocus={() => (activeInput = 'cash')}
          onBlur={() => (activeInput = null)}
        />
        <DisplayField
          label="股票股利 (配股)"
          bind:value={stockDivStr}
          onFocus={() => (activeInput = 'stock')}
          onBlur={() => (activeInput = null)}
        />
      </div>
    </div>
  </div>

  <!-- Right Column: Results & Formulas -->
  <div class="flex w-full flex-col gap-6 lg:w-[55%] xl:w-[60%]">
    {#if price === 0}
      <!-- Empty State -->
      <div
        class="flex h-48 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/30 text-slate-400 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-500"
      >
        <p class="text-lg font-medium">請輸入股價開始試算</p>
        <p class="mt-1 text-sm">支援現金股利與股票股利合併計算</p>
      </div>
    {:else}
      <!-- Results Data Cards -->
      <div class="flex flex-col gap-4">
        <!-- Ex-Dividend Price Card (Full Width) -->
        <div
          class="rounded-3xl border border-slate-200/50 bg-white/60 p-5 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-slate-900/60"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              除權息後參考價
            </h3>
          </div>
          <div class="mt-2 text-4xl font-black tracking-tight text-sky-600 sm:text-5xl dark:text-sky-400">
            {exDivPrice > 0 ? exDivPrice : '0'}
          </div>
        </div>
      </div>

      <!-- Math Formulas Section -->
      {#if showFormulas}
        <div in:slide={{ duration: 300 }} class="space-y-6">
          <div
            class="rounded-3xl border border-slate-200/50 bg-white/40 p-5 shadow-inner backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40"
          >
            <!-- Ex-Dividend Price Reference -->
            <div class="">
              <h4 class="mb-4 text-[15px] font-bold tracking-wide text-slate-700 dark:text-slate-200">
                除權息後股價推演
              </h4>

              {#if stockDiv === 0 && cashDiv > 0}
                <!-- Cash only -->
                <div
                  class="flex flex-wrap items-center gap-2 rounded-2xl bg-white/60 p-5 text-lg font-medium text-slate-800 shadow-sm ring-1 ring-slate-200/60 md:text-xl dark:bg-slate-800/40 dark:text-slate-200 dark:ring-white/5"
                >
                  <span
                    class="mr-2 rounded-md bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >只除息</span
                  >
                  <span>{price} (股價)</span>
                  <span class="text-slate-400">−</span>
                  <span>{cashDiv} (現金股利)</span>
                  <span class="ml-2 font-bold text-slate-400">=</span>
                  <span class="ml-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{exDivPrice}</span>
                </div>
              {:else if cashDiv === 0 && stockDiv > 0}
                <!-- Stock only -->
                <div
                  class="flex flex-wrap items-center gap-2 rounded-2xl bg-white/60 p-5 text-lg font-medium text-slate-800 shadow-sm ring-1 ring-slate-200/60 md:text-xl dark:bg-slate-800/40 dark:text-slate-200 dark:ring-white/5"
                >
                  <span
                    class="mr-2 rounded-md bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    >只除權</span
                  >
                  <div class="flex flex-col items-center">
                    <span class="border-b-2 border-slate-300 px-4 pb-1 dark:border-slate-600">{price} (股價)</span>
                    <div class="flex items-center gap-2 px-3 pt-1">
                      <span>1 +</span>
                      <span class="text-2xl font-light text-slate-300 dark:text-slate-600">(</span>
                      <div class="flex flex-col items-center text-sm md:text-base">
                        <span class="border-b-2 border-slate-300 px-2 dark:border-slate-600">{stockDiv} (配股)</span>
                        <span class="px-2">10</span>
                      </div>
                      <span class="text-2xl font-light text-slate-300 dark:text-slate-600">)</span>
                    </div>
                  </div>
                  <span class="ml-2 font-bold text-slate-400">=</span>
                  <span class="ml-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{exDivPrice}</span>
                </div>
              {:else if cashDiv > 0 && stockDiv > 0}
                <!-- Both -->
                <div
                  class="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800/40 dark:ring-white/5"
                >
                  <p
                    class="mb-5 flex items-center gap-2 text-sm font-medium tracking-wide text-slate-600 dark:text-slate-300"
                  >
                    <span
                      class="rounded-md bg-sky-100 px-2.5 py-1 text-xs font-bold tracking-wider text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                      >台股標準公式</span
                    >
                    同時除權除息 (先除息，再除權)
                  </p>

                  <div class="space-y-6 lg:space-y-7">
                    <!-- Step 1 -->
                    <div>
                      <h5
                        class="mb-3 text-[13px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500"
                      >
                        Step 1. 除息
                      </h5>
                      <div
                        class="flex flex-wrap items-center gap-3 text-lg font-medium text-slate-700 md:text-xl dark:text-slate-200"
                      >
                        <span
                          class="w-24 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-500 lg:w-32"
                          >除息後股價</span
                        >
                        <span class="text-slate-300 dark:text-slate-600">=</span>
                        <span>{price}</span>
                        <span class="text-slate-400">−</span>
                        <span>{cashDiv}</span>
                        <span class="ml-2 text-slate-300 dark:text-slate-600">=</span>
                        <span
                          class="rounded bg-sky-50 px-3 py-1 font-bold text-slate-900 dark:bg-slate-900/50 dark:text-white"
                        >
                          {Number(new Decimal(price).minus(cashDiv).toDecimalPlaces(4))}
                        </span>
                      </div>
                    </div>

                    <!-- Divider -->
                    <div
                      class="h-[2px] w-full bg-gradient-to-r from-slate-200/80 via-slate-100 to-transparent dark:from-slate-700/80 dark:via-slate-800/50"
                    ></div>

                    <!-- Step 2 -->
                    <div>
                      <h5
                        class="mb-3 text-[13px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500"
                      >
                        Step 2. 除權
                      </h5>
                      <div
                        class="flex flex-wrap items-center gap-3 text-lg font-medium text-slate-800 md:text-xl dark:text-slate-200"
                      >
                        <span
                          class="w-24 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-500 lg:w-32"
                          >除權息後股價</span
                        >
                        <span class="text-slate-300 dark:text-slate-600">=</span>
                        <div class="flex flex-col items-center">
                          <span class="border-b-[3px] border-slate-300 px-4 pb-1.5 dark:border-slate-600">
                            {Number(new Decimal(price).minus(cashDiv).toDecimalPlaces(4))}
                          </span>
                          <div class="flex items-center gap-2 px-3 pt-1.5">
                            <span>1 +</span>
                            <span class="text-[28px] leading-none font-light text-slate-300 dark:text-slate-600">(</span
                            >
                            <div class="flex flex-col items-center text-sm md:text-base">
                              <span class="border-b-[3px] border-slate-300 px-2 pb-0.5 dark:border-slate-600"
                                >{stockDiv}</span
                              >
                              <span class="px-2 pt-0.5">10</span>
                            </div>
                            <span class="text-[28px] leading-none font-light text-slate-300 dark:text-slate-600">)</span
                            >
                          </div>
                        </div>
                        <span class="ml-3 text-2xl text-slate-300 dark:text-slate-600">=</span>
                        <span class="ml-1 text-4xl font-black text-sky-500 dark:text-sky-400">{exDivPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Custom Numpad Drawer overlay & component -->
{#if activeInput}
  <!-- 隱形遮罩 (點外側可取消焦點) -->
  <button
    onclick={() => (activeInput = null)}
    class="fixed inset-0 z-40 h-full w-full cursor-default bg-transparent"
    aria-label="關閉鍵盤"
  ></button>

  <div class="relative z-50 md:hidden">
    <CustomNumpad
      value={activeInput === 'price' ? priceStr : activeInput === 'cash' ? cashDivStr : stockDivStr}
      onInput={handleInput}
      onClose={handleCloseNumpad}
    />
  </div>
{/if}
