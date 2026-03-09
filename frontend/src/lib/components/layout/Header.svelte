<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { Menu, Moon, Settings, Sun } from 'lucide-svelte';

  let {
    title = '現股當沖計算',
    onOpenSettings,
    isMobileMenuOpen = $bindable(),
  }: { title?: string; onOpenSettings: () => void; isMobileMenuOpen: boolean } = $props();

  function toggleDarkMode() {
    settings.isDarkMode = !settings.isDarkMode;
  }

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

<header
  class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/80 px-4 backdrop-blur-xl transition-colors duration-300 lg:px-8 dark:border-white/10 dark:bg-slate-950/80"
>
  <div class="flex items-center gap-4">
    <!-- Hamburger for Mobile -->
    <button
      onclick={toggleMobileMenu}
      class="-ml-2 p-2 text-slate-500 transition-colors hover:text-slate-800 lg:hidden dark:text-slate-400 dark:hover:text-white"
      aria-label="打開導覽選單"
    >
      <Menu class="h-6 w-6" />
    </button>

    <h1 class="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
      {title}
    </h1>
  </div>

  <div class="flex items-center gap-1.5 lg:gap-3">
    <!-- Dark Mode Toggle -->
    <button
      onclick={toggleDarkMode}
      class="rounded-full p-2.5 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-sky-500 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-400"
      aria-label={settings.isDarkMode ? '切換為淺色模式' : '切換為深色模式'}
    >
      {#if settings.isDarkMode}
        <Sun class="h-[22px] w-[22px]" />
      {:else}
        <Moon class="h-[22px] w-[22px]" />
      {/if}
    </button>

    <!-- Settings Toggle -->
    <button
      onclick={onOpenSettings}
      class="group rounded-full p-2.5 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label="開啟設定面板"
    >
      <Settings class="h-[22px] w-[22px] transition-transform duration-300 group-hover:rotate-45" />
    </button>
  </div>
</header>
