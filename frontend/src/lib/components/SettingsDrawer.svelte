<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { settingsSchema } from '$lib/utils/schema';
  import { fade, slide } from 'svelte/transition';

  let { onClose }: { onClose: () => void } = $props();

  // 使用本地 state 暫存輸入值，避免未驗證字串直接污染全域 settings
  let rawDiscount = $state<string>(settings.discount);
  let rawMinFee = $state<string>(settings.minFee);
  let rawDefaultLadderRows = $state<string>(settings.defaultLadderRows.toString());

  // 紀錄各欄位的錯誤訊息
  let errors = $state<Record<string, string>>({});

  // 點擊完成按鈕或是背景黑幕，執行 Schema 驗證
  function handleClose() {
    // 預先對字串進行基礎轉換，讓 Zod 進行純粹的資料防守，並使用 String() 強制轉型以防 bind:value 回傳數字
    const parsedDiscount = String(rawDiscount).trim() === '' ? NaN : Number(rawDiscount);
    const parsedMinFee = String(rawMinFee).trim() === '' ? NaN : Number(rawMinFee);
    const parsedDefaultLadderRows = String(rawDefaultLadderRows).trim() === '' ? NaN : Number(rawDefaultLadderRows);

    const result = settingsSchema.safeParse({
      discount: parsedDiscount,
      minFee: parsedMinFee,
      defaultLadderRows: parsedDefaultLadderRows,
      isDayTrade: settings.isDayTrade,
      isDarkMode: settings.isDarkMode,
    });

    if (!result.success) {
      // 擷取 Zod 錯誤訊息並呈現在對應輸入框下方
      const currentErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) {
          currentErrors[field] = issue.message;
        }
      }
      errors = currentErrors;
      return; // 驗證失敗則阻止面板關閉
    }

    // 驗證成功：清除過往錯誤，並將清理後的乾淨資料寫入全域狀態（觸發 LocalStorage 儲存）
    errors = {};
    // 移除無限小數尾數，例如 2.800000 -> 2.8
    settings.discount = parsedDiscount.toString();
    settings.minFee = parsedMinFee.toString();
    settings.defaultLadderRows = parsedDefaultLadderRows;
    onClose();
  }

  // 當使用者重新開始打字時，清除該欄位的紅字錯誤提示
  function clearError(field: string) {
    if (errors[field]) {
      errors[field] = '';
    }
  }
</script>

<!-- 模糊背景罩 -->
<button
  onclick={handleClose}
  in:fade={{ duration: 200 }}
  out:fade={{ duration: 200 }}
  class="fixed inset-0 z-50 h-full w-full cursor-default bg-slate-900/40 backdrop-blur-sm dark:bg-black/80"
  aria-label="關閉設定面板"
></button>

<!-- 從底部滑出的面板 -->
<div
  class="pb-safe fixed bottom-0 left-0 z-50 flex max-h-[85vh] w-full flex-col rounded-t-3xl border-t border-slate-200/50 bg-white/90 pt-2 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
  transition:slide={{ duration: 300, axis: 'y' }}
>
  <!-- 輔助拖拉條 (視覺裝飾) -->
  <div class="flex justify-center pt-2 pb-4">
    <div class="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
  </div>

  <div class="flex items-center justify-between px-6 pb-2">
    <h2 class="text-xl font-bold tracking-tight text-slate-800 dark:text-white">交易設定</h2>
    <button
      onclick={handleClose}
      class="rounded-full bg-slate-100/80 px-5 py-2 text-sm font-semibold text-slate-600 backdrop-blur-md transition-colors duration-150 hover:bg-slate-200/80 hover:text-slate-900 active:scale-95 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-white"
    >
      完成
    </button>
  </div>

  <!-- 滾動內容區塊 -->
  <div class="space-y-6 overflow-y-auto px-6 pb-8">
    <p class="text-sm text-slate-500 dark:text-slate-400">這些設定將會安全地儲存於您的瀏覽器中，每次開啟自動套用。</p>

    <div class="space-y-4">
      <!-- 券商手續費折數 -->
      <div class="space-y-2">
        <label
          for="discountLabel"
          class="block text-sm font-semibold {errors.discount
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-slate-700 dark:text-slate-300'}"
        >
          券商手續費折數
        </label>
        <div class="relative">
          <input
            id="discountLabel"
            type="number"
            inputmode="decimal"
            step="0.1"
            bind:value={rawDiscount}
            oninput={() => clearError('discount')}
            class="w-full border bg-slate-50 pr-12 dark:bg-slate-950 {errors.discount
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'focus:ring-primary-500/50 border-slate-200 dark:border-white/10'} [appearance:textfield] rounded-xl px-4 py-3 text-lg font-medium text-slate-900 shadow-inner transition-all outline-none focus:ring-2 dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="例如：2.8"
          />
          <div class="absolute top-1/2 right-4 -translate-y-1/2 font-medium text-slate-400">折</div>
        </div>

        {#if errors.discount}
          <p class="mt-1 text-sm font-medium text-rose-500 dark:text-rose-400" transition:slide={{ duration: 150 }}>
            {errors.discount}
          </p>
        {:else}
          <p class="text-xs text-slate-400 dark:text-slate-500">
            輸入 0~10。舉例：免手續費為 0，無折讓為 10，2.8 折請輸入 2.8
          </p>
        {/if}

        <!-- 快速折數選擇器 -->
        <div class="flex items-center gap-2 pt-1">
          {#each [0, 2.8, 5, 6, 10] as num}
            <button
              type="button"
              onclick={() => {
                rawDiscount = num.toString();
                clearError('discount');
              }}
              class="flex-1 rounded-xl border border-slate-200/50 bg-white/60 py-2.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md transition-all hover:border-sky-500/30 hover:text-sky-500 active:scale-95 dark:border-white/5 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:text-sky-400"
            >
              {num === 0 ? '免手續' : num === 10 ? '無折讓' : num + ' 折'}
            </button>
          {/each}
        </div>
      </div>

      <!-- 單筆最低手續費 -->
      <div class="space-y-2">
        <label
          for="minFeeLabel"
          class="block text-sm font-semibold {errors.minFee
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-slate-700 dark:text-slate-300'}"
        >
          單筆最低手續費 (元)
        </label>
        <div class="relative">
          <input
            id="minFeeLabel"
            type="number"
            inputmode="numeric"
            step="1"
            bind:value={rawMinFee}
            oninput={() => clearError('minFee')}
            class="w-full border bg-slate-50 pr-16 dark:bg-slate-950 {errors.minFee
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'focus:ring-primary-500/50 border-slate-200 dark:border-white/10'} [appearance:textfield] rounded-xl px-4 py-3 text-lg font-medium text-slate-900 shadow-inner transition-all outline-none focus:ring-2 dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="例如：20"
          />
          <div class="absolute top-1/2 right-4 -translate-y-1/2 font-medium text-slate-400">TWD</div>
        </div>

        {#if errors.minFee}
          <p class="mt-1 text-sm font-medium text-rose-500 dark:text-rose-400" transition:slide={{ duration: 150 }}>
            {errors.minFee}
          </p>
        {:else}
          <p class="text-xs text-slate-400 dark:text-slate-500">一般券商為 20 元，大戶方案可能為 1 元。</p>
        {/if}

        <!-- 快速低消選擇器 -->
        <div class="flex items-center gap-2 pt-1">
          {#each [20, 1, 0] as num}
            <button
              type="button"
              onclick={() => {
                rawMinFee = num.toString();
                clearError('minFee');
              }}
              class="flex-1 rounded-xl border border-slate-200/50 bg-white/60 py-2.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md transition-all hover:border-sky-500/30 hover:text-sky-500 active:scale-95 dark:border-white/5 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:text-sky-400"
            >
              {num} 元
            </button>
          {/each}
        </div>
      </div>

      <!-- 預設顯示階梯檔位數 -->
      <div class="space-y-2">
        <label
          for="ladderRowsLabel"
          class="block text-sm font-semibold {errors.defaultLadderRows
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-slate-700 dark:text-slate-300'}"
        >
          預設顯示推演檔位
        </label>
        <div class="relative">
          <input
            id="ladderRowsLabel"
            type="number"
            inputmode="numeric"
            step="1"
            bind:value={rawDefaultLadderRows}
            oninput={() => clearError('defaultLadderRows')}
            class="w-full border bg-slate-50 pr-16 dark:bg-slate-950 {errors.defaultLadderRows
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'focus:ring-primary-500/50 border-slate-200 dark:border-white/10'} [appearance:textfield] rounded-xl px-4 py-3 text-lg font-medium text-slate-900 shadow-inner transition-all outline-none focus:ring-2 dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="例如：5"
          />
          <div class="absolute top-1/2 right-4 -translate-y-1/2 font-medium text-slate-400">檔</div>
        </div>

        {#if errors.defaultLadderRows}
          <p class="mt-1 text-sm font-medium text-rose-500 dark:text-rose-400" transition:slide={{ duration: 150 }}>
            {errors.defaultLadderRows}
          </p>
        {:else}
          <p class="text-xs text-slate-400 dark:text-slate-500">預設為上下各 5 檔。數量過多可能影響算圖效能。</p>
        {/if}
      </div>
    </div>
  </div>
</div>
