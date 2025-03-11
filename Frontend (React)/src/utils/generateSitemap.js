import { fetchMatches } from '../services/api';

export const generateSitemap = async () => {
  const baseUrl = 'https://pickleball-picks.com';
  const routes = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/matches', changefreq: 'hourly', priority: 0.9 },
    { url: '/profile', changefreq: 'daily', priority: 0.8 },
    { url: '/leaderboard', changefreq: 'daily', priority: 0.7 },
    { url: '/about', changefreq: 'monthly', priority: 0.5 },
    { url: '/privacy-policy', changefreq: 'monthly', priority: 0.3 },
    { url: '/terms-of-service', changefreq: 'monthly', priority: 0.3 },
  ];

  try {
    // Fetch matches to generate dynamic routes
    const matches = await fetchMatches();
    const matchRoutes = matches.map(match => ({
      url: `/match/${match.id}`,
      changefreq: 'hourly',
      priority: 0.6,
      lastmod: new Date().toISOString(),
    }));

    // Combine static and dynamic routes
    const allRoutes = [...routes, ...matchRoutes];

    // Generate sitemap XML with proper formatting
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    ${route.changefreq ? `    <changefreq>${route.changefreq}</changefreq>` : ''}
    ${route.priority ? `    <priority>${route.priority}</priority>` : ''}
    ${route.lastmod ? `    <lastmod>${route.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
}; 