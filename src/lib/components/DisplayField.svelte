<script lang="ts">
	// import { Calculator } from 'lucide-svelte';
	let {
		label,
		value,
		active,
		onClick
	}: { label: string; value: string; active: boolean; onClick: () => void } = $props();

	// 將數值格式化，空值顯示提示詞，有值則加上千分位
	let displayValue = $derived.by(() => {
		if (!value) return '';
		const parts = value.split('.');
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		return parts.join('.');
	});
</script>

<!-- 按鈕本身就是一個假裝的 input，保證高度與觸控體驗 -->
<button
	onclick={onClick}
	class="relative w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 min-h-[72px] shadow-sm backdrop-blur-xl group
        {active 
			? 'border-primary-500 ring-4 ring-primary-500/20 bg-white/90 dark:bg-slate-900/90' 
			: 'border-slate-200/50 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-white/60 hover:bg-white/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/60'}"
>
	<div class="flex flex-col items-start gap-1">
		<span class="text-sm font-medium transition-colors {active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200'}">
			{label}
		</span>
		<div class="flex items-baseline gap-1">
			{#if displayValue}
				<span class="text-2xl font-bold tracking-tight transition-colors {active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-100'}">
					{displayValue}
				</span>
			{:else}
				<span class="text-2xl font-semibold text-slate-300 dark:text-slate-600">0</span>
			{/if}
			
			<!-- 光標動畫 (僅於 active 時呈現) -->
			{#if active}
				<span class="w-[2px] h-6 bg-primary-500 animate-pulse ml-1 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.6)]"></span>
			{/if}
		</div>
	</div>
</button>

<style>
	/* 確保點擊時不會有預設高光 */
	button {
		-webkit-tap-highlight-color: transparent;
	}
</style>
