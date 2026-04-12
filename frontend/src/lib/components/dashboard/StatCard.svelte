<script lang="ts">
  import { cn } from '$lib/utils';
  import { TrendingUp, TrendingDown } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';

  let { 
    title, 
    value, 
    subValue = '', 
    trend = 0, 
    class: className = '' 
  } = $props<{
    title: string;
    value: string;
    subValue?: string;
    trend?: number;
    class?: string;
  }>();

  const isPositive = $derived(trend >= 0);
</script>

<div class={cn(
  "relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-xl backdrop-blur-xl transition-all duration-500",
  isPositive 
    ? "bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20" 
    : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20",
  className
)}>
  <!-- Background Icon Decor -->
  <div class="pointer-events-none absolute -right-6 -bottom-6 opacity-10">
    {#if isPositive}
      <TrendingUp size={160} strokeWidth={2.5} />
    {:else}
      <TrendingDown size={160} strokeWidth={2.5} />
    {/if}
  </div>

  <div class="relative z-10">
    <h3 class="mb-1 text-xs font-bold tracking-widest text-white/70 uppercase">
      {title}
    </h3>
    
    <div class="flex items-baseline gap-2">
      <span class="font-sans text-4xl font-black tracking-tight drop-shadow-sm md:text-5xl">
        {value}
      </span>
    </div>

    {#if subValue}
      <p class="mt-4 text-sm font-medium text-white/80">
        {subValue}
      </p>
    {/if}

    <div class="mt-6 h-1 w-full rounded-full bg-white/20">
      <div 
        class="h-full rounded-full bg-white/40 transition-all duration-1000" 
        style="width: 100%"
      ></div>
    </div>
  </div>
</div>
