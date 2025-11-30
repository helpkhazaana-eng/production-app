// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://khazaana.co.in',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
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