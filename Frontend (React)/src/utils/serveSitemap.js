import { generateSitemap } from './generateSitemap';

export const serveSitemap = async () => {
  try {
    const sitemap = await generateSitemap();
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    document.body.appendChild(link);
    
    // Set response headers
    const headers = new Headers();
    headers.append('Content-Type', 'application/xml');
    headers.append('Content-Disposition', 'inline; filename=sitemap.xml');
    
    return new Response(blob, {
      status: 200,
      headers: headers
    });
  } catch (error) {
    console.error('Error serving sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};