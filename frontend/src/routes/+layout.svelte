<script lang="ts">
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import { t } from '$lib/i18n/index.svelte';
  import '../app.css';

  import { page } from '$app/stores';

  let { children } = $props();

  // Layout states
  let isMobileMenuOpen = $state(false);

  // Route to Title Mapping keys
  const routeTitles: Record<string, string> = {
    '/dividend': 'nav.dividend',
    '/interest': 'nav.interest',
    '/': 'nav.trade',
  };

  let pageTitle = $derived.by(() => {
    const path = $page.url.pathname;
    // Find the longest matching prefix (excluding root '/')
    const match = Object.keys(routeTitles)
      .filter((route) => route !== '/')
      .find((route) => path.startsWith(route));

    const key = match ? routeTitles[match] : routeTitles['/'];
    return t(key);
  });
</script>

<!-- Theme Wrapper -->
<div
  class="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900 transition-colors duration-300 selection:bg-sky-500/30 dark:bg-slate-950 dark:text-slate-50"
>
  <!-- Sidebar (Desktop and Mobile Wrapper) -->
  <Sidebar bind:isMobileMenuOpen />

  <!-- Main Content Area Wrapper -->
  <div class="relative flex min-h-screen flex-1 flex-col">
    <Header title={pageTitle} bind:isMobileMenuOpen />

    <main class="mx-auto flex w-full max-w-lg flex-1 flex-col p-4 md:max-w-3xl lg:max-w-5xl lg:p-8">
      <!-- 路由注入區 -->
      <div class="flex-1">
        {@render children()}
      </div>
      <Footer />
    </main>
  </div>
</div>
