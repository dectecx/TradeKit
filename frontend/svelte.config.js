import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // Static site generation: outputs pure HTML/CSS/JS to the build/ folder.
    // Suitable for zip distribution, manual Netlify deploys, or any static hosting.
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html', // SPA fallback: serves 404.html for all routes (client-side routing)
      precompress: false,
      strict: true,
    }),
  },
};

export default config;
