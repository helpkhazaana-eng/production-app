import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://khazaana.co.in';

  const robotsTxt = `# Khazaana Food Ordering Platform - Robots.txt
# Best Food Delivery in Aurangabad, West Bengal
# Domain: ${siteUrl}

User-agent: *
Allow: /
Allow: /restaurants/
Allow: /about
Allow: /terms
Disallow: /checkout
Disallow: /history
Disallow: /cart
Disallow: /test-order
Disallow: /404

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Google
User-agent: Googlebot
Allow: /
Allow: /restaurants/
Disallow: /checkout
Disallow: /history
Disallow: /cart

User-agent: Googlebot-Image
Allow: /
Allow: /_astro/
Allow: /images/

User-agent: Googlebot-Mobile
Allow: /

# Bing
User-agent: Bingbot
Allow: /
Allow: /restaurants/
Disallow: /checkout
Disallow: /history
Disallow: /cart

# Yandex
User-agent: Yandex
Allow: /
Disallow: /checkout
Disallow: /history

# DuckDuckGo
User-agent: DuckDuckBot
Allow: /

# Host directive
Host: ${siteUrl}
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
