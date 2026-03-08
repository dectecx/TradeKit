<script lang="ts">
  import { Delete } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  let { value, onInput, onClose }: { value: string; onInput: (key: string) => void; onClose: () => void } = $props();

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'clear'];

  /**
   * 觸發按鍵時，將處理邏輯交還給父層的全局管理
   */
  function handleKeyClick(key: string) {
    onInput(key);
  }
</script>

<div
  class="pb-safe fixed bottom-0 left-0 z-50 w-full rounded-t-3xl border-t border-slate-200/50 bg-white/80 pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80"
  transition:slide={{ duration: 250, axis: 'y' }}
>
  <div class="flex justify-end px-4 pb-3">
    <button
      onclick={onClose}
      class="rounded-full bg-slate-100/80 px-5 py-2 text-sm font-semibold text-slate-600 backdrop-blur-md transition-colors duration-150 hover:bg-slate-200/80 hover:text-slate-900 active:scale-95 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-white"
    >
      完成
    </button>
  </div>

  <div class="grid grid-cols-3 gap-2 bg-slate-100/50 p-3 dark:bg-slate-950/50">
    {#each keys as key}
      <button
        onclick={() => handleKeyClick(key)}
        class="flex h-[64px] items-center justify-center rounded-2xl border border-slate-200/50 bg-white text-2xl font-semibold shadow-sm transition-all active:scale-95 active:bg-slate-200 dark:border-white/5 dark:bg-slate-800 dark:active:bg-slate-700
					{key === 'clear' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}"
        aria-label={key === 'clear' ? '刪除' : key}
      >
        {#if key === 'clear'}
          <Delete size={28} />
        {:else}
          {key}
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  /* 防止由於多次點擊而選取文字 (Mobile-First 關鍵) */
  button {
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* iOS 安全區域底部間距適配 */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
