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
  <title>TradeKit - 台股當沖精算</title>
  <meta name="description" content="極致精確、低阻力的現代化台股當沖試算工具" />
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
      <Header title="現股當沖計算" onOpenSettings={() => (isSettingsOpen = true)} bind:isMobileMenuOpen />

      <main class="mx-auto w-full max-w-lg flex-1 overflow-y-auto p-4 md:max-w-3xl lg:max-w-5xl lg:p-8">
        <!-- 路由注入區 -->
        {@render children()}
        <Footer />
      </main>
    </div>
  </div>

  {#if isSettingsOpen}
    <SettingsDrawer onClose={() => (isSettingsOpen = false)} />
  {/if}
</div>
