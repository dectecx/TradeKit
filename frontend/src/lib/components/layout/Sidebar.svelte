<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { Calculator, ChartLine, History, X } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  // Navigation Items
  const navItems = [
    { name: '現股當沖計算', icon: Calculator, href: '/', active: true },
    { name: '除權息試算', icon: ChartLine, href: '#', active: false },
    { name: '歷史損益', icon: History, href: '#', active: false },
  ];

  let { isMobileMenuOpen = $bindable(false) }: { isMobileMenuOpen: boolean } = $props();

  function toggleMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

<!-- Desktop Sidebar (Hidden on Mobile) -->
<aside
  class="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-slate-50 lg:flex dark:border-white/10 dark:bg-slate-900"
>
  <div class="flex h-16 items-center border-b border-slate-200 px-6 dark:border-white/10">
    <div class="flex items-center gap-3">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 font-bold text-white shadow-lg shadow-sky-500/20"
      >
        TK
      </div>
      <span class="text-xl font-bold tracking-tight text-slate-800 dark:text-white">TradeKit</span>
    </div>
  </div>

  <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-6">
    {#each navItems as item}
      <a
        href={item.href}
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 {item.active
          ? 'bg-sky-500/10 font-semibold text-sky-600 dark:text-sky-400'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:text-slate-400 dark:hover:bg-slate-800/50'}"
        aria-current={item.active ? 'page' : undefined}
      >
        <item.icon class="h-5 w-5 {item.active ? 'text-sky-500' : ''}" />
        {item.name}
      </a>
    {/each}
  </nav>

  <div class="border-t border-slate-200 p-4 dark:border-white/10">
    <div class="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/50">
      <p class="text-xs font-medium text-slate-500 dark:text-slate-400">目前折數</p>
      <p class="mt-0.5 text-lg font-bold text-slate-800 dark:text-white">
        {settings.discount} <span class="text-sm font-normal text-slate-500">折</span>
      </p>
    </div>
  </div>
</aside>

<!-- Mobile Fullscreen Menu -->
{#if isMobileMenuOpen}
  <div
    class="fixed inset-0 z-50 flex flex-col bg-slate-50/95 backdrop-blur-xl lg:hidden dark:bg-slate-950/95"
    transition:fade={{ duration: 200 }}
  >
    <div class="flex h-16 items-center justify-between border-b border-slate-200/50 px-4 dark:border-white/10">
      <div class="flex items-center gap-3">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 font-bold text-white shadow-lg shadow-sky-500/20"
        >
          TK
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-800 dark:text-white">TradeKit</span>
      </div>
      <button
        onclick={toggleMenu}
        class="-mr-2 p-2 text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        aria-label="關閉選單"
      >
        <X class="h-6 w-6" />
      </button>
    </div>

    <nav class="flex-1 space-y-2 overflow-y-auto px-4 py-6">
      <p class="mb-2 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">工具清單</p>
      {#each navItems as item}
        <a
          href={item.href}
          onclick={item.active ? undefined : toggleMenu}
          class="flex items-center gap-4 rounded-2xl px-4 py-4 transition-all {item.active
            ? 'border border-sky-500/20 bg-sky-500/10 text-sky-600 shadow-sm dark:text-sky-400'
            : 'border border-slate-200/50 bg-white text-slate-700 shadow-sm dark:border-white/5 dark:bg-slate-900 dark:text-slate-300'}"
        >
          <div class="rounded-xl p-2 {item.active ? 'bg-sky-500/20' : 'bg-slate-100 dark:bg-slate-800'}">
            <item.icon class="h-6 w-6 {item.active ? 'text-sky-500' : 'text-slate-500'}" />
          </div>

          <span class="text-lg font-semibold">{item.name}</span>
        </a>
      {/each}
    </nav>
  </div>
{/if}
