<script lang="ts">
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import '../app.css';

  let { children } = $props();

  // Layout states
  let isSettingsOpen = $state(false);
  let isMobileMenuOpen = $state(false);
</script>

<svelte:head>
  <title>台股 / 當沖計算機 - TradeKit 損益推演與手續費精算</title>
  <meta
    name="description"
    content="專為台灣股市設計的現代化當沖計算機。支援單筆獲利試算與多檔位損益推演，精準扣除券商手續費與證交稅，協助當沖客快速判斷出場點。"
  />
</svelte:head>

<!-- Theme Wrapper -->
<div class={settings.isDarkMode ? 'dark' : ''}>
  <div
    class="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900 transition-colors duration-300 selection:bg-sky-500/30 dark:bg-slate-950 dark:text-slate-50"
  >
    <!-- Sidebar (Desktop and Mobile Wrapper) -->
    <Sidebar bind:isMobileMenuOpen />

    <!-- Main Content Area Wrapper -->
    <div class="relative flex h-screen flex-1 flex-col overflow-hidden">
      <Header title="台股 / 當沖計算機" onOpenSettings={() => (isSettingsOpen = true)} bind:isMobileMenuOpen />

      <main class="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-y-auto p-4 md:max-w-3xl lg:max-w-5xl lg:p-8">
        <!-- 路由注入區 -->
        <div class="flex-1">
          {@render children()}
        </div>
        <Footer />
      </main>
    </div>
  </div>

  {#if isSettingsOpen}
    <SettingsDrawer onClose={() => (isSettingsOpen = false)} />
  {/if}
</div>
