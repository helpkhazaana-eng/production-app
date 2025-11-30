// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Site URL from environment variable
// Vercel sets VERCEL_URL automatically
// Production: https://khazaana.co.in
// Staging: https://<project>.vercel.app
const siteUrl = process.env.PUBLIC_SITE_URL || 
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                'https://khazaana.co.in';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  // Always use trailing slash for consistent URLs
  trailingSlash: 'always',
  // Static output for best performance
  output: 'static',
  // Vercel adapter for deployment
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.PUBLIC_SITE_URL': JSON.stringify(siteUrl),
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
    domains: [],
  },
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro'
  }
});