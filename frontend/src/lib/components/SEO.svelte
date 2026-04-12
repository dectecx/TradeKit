<script lang="ts">
  import { t } from '$lib/i18n/index.svelte';
  import { page } from '$app/stores';

  let { 
    title = '', 
    description = '', 
    ogType = 'website',
    image = 'https://tradekit-tw.netlify.app/og-image.png'
  } = $props();

  const siteName = 'TradeKit';
  const defaultDesc = t('seo.description');
  const finalDescription = description || defaultDesc;
  const canonicalUrl = $derived(`https://tradekit-tw.netlify.app${$page.url.pathname}`);

  // JSON-LD Structured Data
  let jsonLd = $derived({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title || siteName,
    "description": finalDescription,
    "applicationCategory": "FinancialApplication",
    "operatingSystem": "Universal",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TWD"
    },
    "author": {
      "@type": "Organization",
      "name": "TradeKit Team"
    }
  });
</script>

<svelte:head>
  <!-- Basic -->
  <title>{title}</title>
  <meta name="description" content={finalDescription} />
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph -->
  <meta property="og:site_name" content={siteName} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={finalDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content={ogType} />
  <meta property="og:image" content={image} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={finalDescription} />
  <meta name="twitter:image" content={image} />

  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>
