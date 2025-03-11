import React, { useEffect, useState } from 'react';
import { generateSitemap } from '../utils/generateSitemap';

const Sitemap = () => {
  const [sitemap, setSitemap] = useState('');

  useEffect(() => {
    const fetchSitemap = async () => {
      const sitemapContent = await generateSitemap();
      if (sitemapContent) {
        setSitemap(sitemapContent);
      }
    };

    fetchSitemap();
  }, []);

  return (
    <div style={{ whiteSpace: 'pre-wrap', padding: '20px' }}>
      {sitemap}
    </div>
  );
};

export default Sitemap;
