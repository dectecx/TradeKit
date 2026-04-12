<script lang="ts">
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { Calculator, Coins, History, Percent, X, Languages } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  import { page } from '$app/stores';

  // Navigation Items (reactively calculated based on current URL)
  let navItems = $derived([
    { name: t('nav.trade'), icon: Calculator, href: '/', active: $page.url.pathname === '/' },
    { name: t('nav.dividend'), icon: Percent, href: '/dividend', active: $page.url.pathname.startsWith('/dividend') },
    { name: t('nav.interest'), icon: Coins, href: '/interest', active: $page.url.pathname.startsWith('/interest') },
    { name: t('nav.history'), icon: History, href: '#', active: false },
  ]);

  let { isMobileMenuOpen = $bindable(false) }: { isMobileMenuOpen: boolean } = $props();

  function toggleMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  function setLocale(locale: 'zh-TW' | 'en') {
    i18n.locale = locale;
  }
</script>

<!-- Desktop Sidebar (Hidden on Mobile) -->
<aside
  class="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50 lg:flex dark:border-white/10 dark:bg-slate-900"
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

  <!-- Desktop Bottom Settings -->
  <div class="border-t border-slate-200 p-4 dark:border-white/10">
    <div class="mb-3 flex items-center gap-2 px-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
       <Languages size={14} />
       <span>{t('nav.settings')}</span>
    </div>
    <div class="flex gap-2 rounded-2xl bg-white p-1 shadow-sm dark:bg-slate-950/50">
       <button 
         onclick={() => setLocale('zh-TW')}
         class="flex-1 rounded-xl py-2 text-xs font-bold transition-all {i18n.locale === 'zh-TW' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}"
       >
         {t('common.zhTW')}
       </button>
       <button 
         onclick={() => setLocale('en')}
         class="flex-1 rounded-xl py-2 text-xs font-bold transition-all {i18n.locale === 'en' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}"
       >
         {t('common.en')}
       </button>
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
        aria-label={t('common.closeMenu')}
      >
        <X class="h-6 w-6" />
      </button>
    </div>

    <nav class="flex-1 space-y-2 overflow-y-auto px-4 py-6">
      <p class="mb-2 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">{t('nav.tools')}</p>
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

    <!-- Mobile Bottom Settings -->
    <div class="mt-auto border-t border-slate-200/50 p-6 dark:border-white/10">
      <div class="mb-4 flex items-center gap-2 px-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
         <Languages size={16} />
         <span>{t('nav.settings')}</span>
      </div>
      <div class="flex gap-2 rounded-2xl bg-white p-1.5 shadow-md dark:bg-slate-900 border border-slate-200/50 dark:border-white/5">
         <button 
           onclick={() => { setLocale('zh-TW'); toggleMenu(); }}
           class="flex-1 rounded-xl py-3 text-sm font-bold transition-all {i18n.locale === 'zh-TW' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500'}"
         >
           {t('common.zhTW')}
         </button>
         <button 
           onclick={() => { setLocale('en'); toggleMenu(); }}
           class="flex-1 rounded-xl py-3 text-sm font-bold transition-all {i18n.locale === 'en' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500'}"
         >
           {t('common.en')}
         </button>
      </div>
    </div>
  </div>
{/if}
