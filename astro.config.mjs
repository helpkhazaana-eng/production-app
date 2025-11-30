// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Site URL from environment variable (set by Netlify)
// Production: https://khazaana.co.in
// Staging: https://khazaana2.netlify.app
const siteUrl = process.env.SITE_URL || process.env.URL || 'https://khazaana.co.in';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  // Always use trailing slash for consistent URLs
  trailingSlash: 'always',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(siteUrl),
    }
  },
  image: {
    // Use sharp for image optimization (converts to WebP automatically)
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      }
    },
    // Domains for remote images (if any)
    domains: [],
  },
  build: {
    // Inline small assets as base64
    inlineStylesheets: 'auto',
    assets: '_astro'
  },
  // Ensure images are generated during build
  output: 'static'
});