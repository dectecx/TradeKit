<script lang="ts">
  import { X } from 'lucide-svelte';

  let {
    label,
    value = $bindable(),
    onFocus,
    onBlur,
  }: {
    label: string;
    value: string;
    onFocus?: () => void;
    onBlur?: () => void;
  } = $props();

  let inputRef = $state<HTMLInputElement | null>(null);
  let isFocused = $state(false);

  // 千分位格式化 (僅在失焦時使用)
  function formatWithCommas(val: string): string {
    if (!val) return '';
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  // 顯示值：聚焦時顯示原始數字，失焦時顯示千分位格式
  let displayValue = $derived(isFocused ? value : formatWithCommas(value));

  // 原生 Input 事件攔截 (只允許數字與小數點)
  function handleNativeInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    let val = target.value;

    // 移除千分位逗號 (防止從格式化值編輯時殘留)
    val = val.replace(/,/g, '');

    // 只允許數字與小數點
    val = val.replace(/[^0-9.]/g, '');

    // 確保最多只有一個小數點
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    // 避免如 '01' 這種開頭帶有多餘 0 的情況，但保留 '0.'
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '');
      if (val === '') val = '0';
      else if (val.startsWith('.')) val = '0' + val;
    }

    value = val;
  }

  function handleFocus() {
    isFocused = true;
    onFocus?.();
  }

  function handleBlur() {
    isFocused = false;
    onBlur?.();
  }

  function handleClear(e: Event) {
    e.stopPropagation();
    value = '';
    inputRef?.focus();
  }

  // 點擊 label 或外框空白處時，自動聚焦到 input
  function handleContainerClick() {
    inputRef?.focus();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  onclick={handleContainerClick}
  class="group relative flex min-h-[72px] w-full cursor-text items-center rounded-2xl border p-4 shadow-sm backdrop-blur-xl transition-all duration-200
        {isFocused
    ? 'border-sky-500 bg-white/90 ring-4 ring-sky-500/20 dark:bg-slate-900/90'
    : 'border-slate-200/50 bg-white/60 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-slate-800/40 dark:hover:border-white/20 dark:hover:bg-slate-800/60'}"
>
  <div class="flex w-full flex-col items-start gap-1">
    <span
      class="text-sm font-medium transition-colors {isFocused
        ? 'text-sky-600 dark:text-sky-400'
        : 'text-slate-500 group-hover:text-slate-600 dark:text-slate-300 dark:group-hover:text-slate-200'}"
    >
      {label}
    </span>
    <div class="relative flex w-full items-center">
      <input
        bind:this={inputRef}
        type="text"
        inputmode="decimal"
        value={displayValue}
        oninput={handleNativeInput}
        onfocus={handleFocus}
        onblur={handleBlur}
        class="w-full bg-transparent pr-12 text-2xl font-bold tracking-tight text-slate-900 placeholder-slate-300 outline-none dark:text-white dark:placeholder-slate-600"
        placeholder="0"
      />

      <!-- 清除按鈕 (X) -->
      {#if value !== ''}
        <div class="absolute inset-y-0 right-0 flex items-center pr-1">
          <button
            type="button"
            tabindex="-1"
            onmousedown={(e) => e.preventDefault()}
            onclick={handleClear}
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="清除欄位內容"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
