import { browser } from '$app/environment';

/**
 * TradeKit 全域設定狀態管理 (Svelte 5 Runes)
 * 負責將設定值同步到瀏覽器的 localStorage 中，並確保 SSR 安全。
 */
class SettingsStore {
  // 使用 $state 宣告核心資料
  discount = $state<string>('2.8');
  minFee = $state<string>('20');
  defaultLadderRows = $state<number>(5);
  isDayTrade = $state<boolean>(true);
  isDarkMode = $state<boolean>(true);
  targetProfitPercent = $state<number>(2.0); // 預設 2% 停利
  stopLossPercent = $state<number>(-2.0);    // 預設 -2% 停損

  // 根據設定推導的顯示用折數標籤 (例如：2.8 折, 無折讓, 免手續費)
  discountLabel = $derived.by(() => {
    const d = parseFloat(this.discount);
    if (d === 0) return '免手續費';
    if (d === 10) return '無折讓';
    return `${this.discount} 折`;
  });

  // 根據設定推導的顏色類別
  discountColorClass = $derived.by(() => {
    const d = parseFloat(this.discount);
    if (d === 0) return 'text-sky-500 dark:text-sky-400'; // 免手續費
    if (d === 10) return 'text-slate-400 dark:text-slate-500'; // 無折讓
    return 'text-slate-500 dark:text-slate-400'; // 一般折數
  });

  constructor() {
    // 1. 初始化時，若處於瀏覽器環境，則嘗試從 localStorage 讀取舊資料
    if (browser) {
      const storedDiscount = localStorage.getItem('tk_discount');
      if (storedDiscount) this.discount = storedDiscount;

      const storedMinFee = localStorage.getItem('tk_minFee');
      if (storedMinFee) this.minFee = storedMinFee;

      const storedLadderRows = localStorage.getItem('tk_defaultLadderRows');
      if (storedLadderRows) this.defaultLadderRows = parseInt(storedLadderRows, 10);

      const storedIsDayTrade = localStorage.getItem('tk_isDayTrade');
      if (storedIsDayTrade !== null) this.isDayTrade = storedIsDayTrade === 'true';

      const storedIsDarkMode = localStorage.getItem('tk_isDarkMode');
      if (storedIsDarkMode !== null) {
        this.isDarkMode = storedIsDarkMode === 'true';
      } else {
        // 若未設定過，預設為暗黑模式
        this.isDarkMode = true;
      }

      const storedTargetProfit = localStorage.getItem('tk_targetProfit');
      if (storedTargetProfit) this.targetProfitPercent = parseFloat(storedTargetProfit);

      const storedStopLoss = localStorage.getItem('tk_stopLoss');
      if (storedStopLoss) this.stopLossPercent = parseFloat(storedStopLoss);
    }

    // 2. 利用出色的 Svelte 5 $effect.root 監聽狀態改變並寫回 localStorage
    // 注意：在 class 內部使用 $effect 需要包裹在 $effect.root 中以確保生命週期獨立運作
    if (browser) {
      $effect.root(() => {
        $effect(() => {
          localStorage.setItem('tk_discount', this.discount);
        });

        $effect(() => {
          localStorage.setItem('tk_minFee', this.minFee);
        });

        $effect(() => {
          localStorage.setItem('tk_defaultLadderRows', String(this.defaultLadderRows));
        });

        $effect(() => {
          localStorage.setItem('tk_isDayTrade', String(this.isDayTrade));
        });

        $effect(() => {
          localStorage.setItem('tk_isDarkMode', String(this.isDarkMode));
          // 同步更新 DOM 的 class 以觸發 Tailwind 的 Dark Mode
          if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        });

        $effect(() => {
          localStorage.setItem('tk_targetProfit', String(this.targetProfitPercent));
        });

        $effect(() => {
          localStorage.setItem('tk_stopLoss', String(this.stopLossPercent));
        });
      });
    }
  }
}

// 匯出一個單例 (Singleton) 供全域元件共用
export const settings = new SettingsStore();
