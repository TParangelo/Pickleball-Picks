import React, { useEffect } from 'react';
import { generateSitemap } from '../utils/generateSitemap';

const SitemapXML = () => {
  useEffect(() => {
    const serveSitemap = async () => {
      try {
        const sitemap = await generateSitemap();
        const blob = new Blob([sitemap], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        window.location.href = url;
      } catch (error) {
        console.error('Error serving sitemap:', error);
      }
    };

    serveSitemap();
  }, []);

  return null; // This component doesn't render anything
};

export default SitemapXML; 