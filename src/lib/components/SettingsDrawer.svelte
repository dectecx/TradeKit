<script lang="ts">
  import { settings } from "$lib/stores/settings.svelte";
  import { settingsSchema } from "$lib/utils/schema";
  import { fade, slide } from "svelte/transition";

  let { onClose }: { onClose: () => void } = $props();

  // 使用本地 state 暫存輸入值，避免未驗證字串直接污染全域 settings
  let rawDiscount = $state<string>(settings.discount);
  let rawMinFee = $state<string>(settings.minFee);

  // 紀錄各欄位的錯誤訊息
  let errors = $state<Record<string, string>>({});

  // 點擊完成按鈕或是背景黑幕，執行 Schema 驗證
  function handleClose() {
    // 預先對字串進行基礎轉換，讓 Zod 進行純粹的資料防守
    const parsedDiscount = rawDiscount.trim() === "" ? NaN : Number(rawDiscount);
    const parsedMinFee = rawMinFee.trim() === "" ? NaN : Number(rawMinFee);

    const result = settingsSchema.safeParse({
      discount: parsedDiscount,
      minFee: parsedMinFee,
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
    onClose();
  }

  // 當使用者重新開始打字時，清除該欄位的紅字錯誤提示
  function clearError(field: string) {
    if (errors[field]) {
      errors[field] = "";
    }
  }
</script>

<!-- 模糊背景罩 -->
<button
  onclick={handleClose}
  in:fade={{ duration: 200 }}
  out:fade={{ duration: 200 }}
  class="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-50 w-full h-full cursor-default"
  aria-label="關閉設定面板"
></button>

<!-- 從底部滑出的面板 -->
<div
  class="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/50 dark:border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] pb-safe rounded-t-3xl z-50 pt-2 flex flex-col max-h-[85vh]"
  transition:slide={{ duration: 300, axis: "y" }}
>
  <!-- 輔助拖拉條 (視覺裝飾) -->
  <div class="flex justify-center pt-2 pb-4">
    <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
  </div>

  <div class="px-6 pb-2 flex justify-between items-center">
    <h2 class="text-xl font-bold tracking-tight text-slate-800 dark:text-white">交易設定</h2>
    <button
      onclick={handleClose}
      class="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 backdrop-blur-md rounded-full active:scale-95 duration-150"
    >
      完成
    </button>
  </div>

  <!-- 滾動內容區塊 -->
  <div class="overflow-y-auto px-6 pb-8 space-y-6">
    <p class="text-sm text-slate-500 dark:text-slate-400">這些設定將會安全地儲存於您的瀏覽器中，每次開啟自動套用。</p>

    <div class="space-y-4">
      <!-- 券商手續費折數 -->
      <div class="space-y-2">
        <label
          for="discountLabel"
          class="block text-sm font-semibold {errors.discount ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}"
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
            oninput={() => clearError("discount")}
            class="w-full pr-12 bg-slate-50 dark:bg-slate-950 border {errors.discount
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'border-slate-200 dark:border-white/10 focus:ring-primary-500/50'} rounded-xl px-4 py-3 text-lg font-medium text-slate-900 dark:text-white focus:ring-2 outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="例如：2.8"
          />
          <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">折</div>
        </div>

        {#if errors.discount}
          <p class="text-sm font-medium text-rose-500 dark:text-rose-400 mt-1" transition:slide={{ duration: 150 }}>
            {errors.discount}
          </p>
        {:else}
          <p class="text-xs text-slate-400 dark:text-slate-500">輸入 0~10。舉例：免手續費為 0，無折讓為 10，2.8 折請輸入 2.8</p>
        {/if}
      </div>

      <!-- 單筆最低手續費 -->
      <div class="space-y-2">
        <label
          for="minFeeLabel"
          class="block text-sm font-semibold {errors.minFee ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}"
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
            oninput={() => clearError("minFee")}
            class="w-full pr-16 bg-slate-50 dark:bg-slate-950 border {errors.minFee
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'border-slate-200 dark:border-white/10 focus:ring-primary-500/50'} rounded-xl px-4 py-3 text-lg font-medium text-slate-900 dark:text-white focus:ring-2 outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="例如：20"
          />
          <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">TWD</div>
        </div>

        {#if errors.minFee}
          <p class="text-sm font-medium text-rose-500 dark:text-rose-400 mt-1" transition:slide={{ duration: 150 }}>
            {errors.minFee}
          </p>
        {:else}
          <p class="text-xs text-slate-400 dark:text-slate-500">一般券商為 20 元，大戶方案可能為 1 元。</p>
        {/if}
      </div>
    </div>
  </div>
</div>
