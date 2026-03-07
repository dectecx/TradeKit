<script lang="ts">
	import { Delete } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	let {
		value,
		onInput,
		onClose
	}: { value: string; onInput: (key: string) => void; onClose: () => void } = $props();

	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'clear'];

	/**
	 * 觸發按鍵時，將處理邏輯交還給父層的全局管理
	 */
	function handleKeyClick(key: string) {
        onInput(key);
	}
</script>

<div
	class="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200/50 dark:border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] pb-safe rounded-t-3xl z-50 pt-3"
	transition:slide={{ duration: 250, axis: 'y' }}
>
	<div class="px-4 pb-3 flex justify-end">
		<button
			onclick={onClose}
			class="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 backdrop-blur-md rounded-full active:scale-95 duration-150"
		>
			完成
		</button>
	</div>

	<div class="grid grid-cols-3 gap-2 p-3 bg-slate-100/50 dark:bg-slate-950/50">
		{#each keys as key}
			<button
				onclick={() => handleKeyClick(key)}
				class="h-[64px] flex items-center justify-center text-2xl font-semibold bg-white dark:bg-slate-800 rounded-2xl active:bg-slate-200 dark:active:bg-slate-700 active:scale-95 transition-all shadow-sm border border-slate-200/50 dark:border-white/5
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
