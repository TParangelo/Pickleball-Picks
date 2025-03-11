import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title = 'PicklePicks - Pickleball Betting Platform',
  description = 'Place virtual wagers on professional pickleball matches. Get real-time odds, track your bets, and compete with friends in our social betting platform.',
  keywords = 'pickleball, betting, sports betting, pickleball odds, pickleball matches',
  image = '../assets/GreenLogo.png',
  url = 'https://pickleball-picks.com'
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO; 