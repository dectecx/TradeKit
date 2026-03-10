<script lang="ts">
  import { X } from 'lucide-svelte';

  let {
    label,
    value = $bindable(),
    active,
    onClick,
  }: {
    label: string;
    value: string;
    active: boolean;
    onClick: () => void;
  } = $props();

  // 將數值格式化，空值顯示提示詞，有值則加上千分位
  let displayValue = $derived.by(() => {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  });

  let inputRef = $state<HTMLInputElement | null>(null);

  // 當切換為 active 狀態時，自動選取輸入框，讓原生的虛擬游標出現
  $effect(() => {
    if (active && inputRef) {
      inputRef.focus();
    }
  });

  // 原生 Input 事件攔截機制 (供 Desktop 實體鍵盤與選取後刪除使用)
  function handleNativeInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    let val = target.value;

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

    // 雙向綁定更新給外層狀態
    value = val;
  }
</script>

<div
  role="presentation"
  onclick={onClick}
  class="group relative flex min-h-[72px] w-full cursor-text items-center justify-between rounded-2xl border p-4 shadow-sm backdrop-blur-xl transition-all duration-200
        {active
    ? 'border-sky-500 bg-white/90 ring-4 ring-sky-500/20 dark:bg-slate-900/90'
    : 'border-slate-200/50 bg-white/60 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-slate-800/40 dark:hover:border-white/20 dark:hover:bg-slate-800/60'}"
>
  <div class="flex w-full flex-col items-start gap-1">
    <span
      class="text-sm font-medium transition-colors {active
        ? 'text-sky-600 dark:text-sky-400'
        : 'text-slate-500 group-hover:text-slate-600 dark:text-slate-300 dark:group-hover:text-slate-200'}"
    >
      {label}
    </span>
    <div class="relative flex w-full items-center pr-10">
      {#if active}
        <!-- 使用 inputmode="none" 來避免手機喚起原生小鍵盤，同時在桌機能讓游標可選可刪除 -->
        <input
          bind:this={inputRef}
          type="text"
          inputmode="none"
          bind:value
          oninput={handleNativeInput}
          class="w-full bg-transparent text-2xl font-bold tracking-tight text-slate-900 placeholder-slate-300 outline-none dark:text-white dark:placeholder-slate-600"
          placeholder="0"
        />
      {:else}
        <span
          class="text-2xl font-bold tracking-tight transition-colors {value
            ? 'text-slate-700 dark:text-slate-100'
            : 'text-slate-300 dark:text-slate-600'}"
        >
          {displayValue || '0'}
        </span>
      {/if}
    </div>
  </div>

  <!-- 清除按鈕 (X) -->
  {#if value !== ''}
    <div
      role="button"
      tabindex="0"
      onclick={(e) => {
        e.stopPropagation();
        value = '';
        if (active && inputRef) inputRef.focus();
      }}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          value = '';
          if (active && inputRef) inputRef.focus();
        }
      }}
      class="absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      aria-label="清除欄位內容"
    >
      <X class="h-5 w-5" />
    </div>
  {/if}
</div>
