import type { APIRoute } from 'astro';
import { restaurants } from '../data/restaurants';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://khazaana.co.in';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/restaurants/', priority: '0.95', changefreq: 'daily' },
    { url: '/about/', priority: '0.70', changefreq: 'monthly' },
    { url: '/terms/', priority: '0.50', changefreq: 'monthly' },
  ];

  const restaurantPages = restaurants.map((r) => ({
    url: `/restaurants/${r.id}/`,
    priority: r.featured ? '0.95' : '0.85',
    changefreq: 'daily',
    image: {
      loc: `${siteUrl}/images/restaurants/${r.id}.jpg`,
      title: `${r.name} - Best ${r.cuisine[0]} in Aurangabad, West Bengal`,
      caption: `${r.name} menu and food delivery in College More, Aurangabad`,
    },
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${siteUrl}/images/logo.png</image:loc>
      <image:title>Khazaana - Best Food Delivery in Aurangabad</image:title>
    </image:image>
  </url>
  
  <!-- Static Pages -->
${staticPages.slice(1).map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
  
  <!-- Restaurant Pages -->
${restaurantPages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <image:image>
      <image:loc>${page.image.loc}</image:loc>
      <image:title>${page.image.title}</image:title>
      <image:caption>${page.image.caption}</image:caption>
    </image:image>
  </url>`).join('\n')}
  
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
