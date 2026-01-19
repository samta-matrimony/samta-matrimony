import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
}

const MetaSEO: React.FC<SEOProps> = ({
  title = 'Samta Matrimony - Trusted Partner Discovery',
  description = 'Join Samta Matrimony, the most trusted site to find your perfect life partner. We celebrate cultural values and modernize the matchmaking experience.',
  keywords = 'matrimony, marriage, life partner, indian wedding, matchmaking, verified profiles',
  image = 'https://samta-matrimony.com/og-image.jpg',
  canonical,
}) => {
  const location = useLocation();
  const currentUrl = `https://samta-matrimony.com${location.pathname}${location.search}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    const updateOrCreateMeta = (name: string, content: string, attr: string = 'name'): void => {
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update standard meta tags
    updateOrCreateMeta('description', description);
    updateOrCreateMeta('keywords', keywords);

    // Update OpenGraph meta tags
    updateOrCreateMeta('og:title', title, 'property');
    updateOrCreateMeta('og:description', description, 'property');
    updateOrCreateMeta('og:image', image, 'property');
    updateOrCreateMeta('og:url', currentUrl, 'property');
    updateOrCreateMeta('og:type', 'website', 'property');

    // Update Twitter Card meta tags
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', title);
    updateOrCreateMeta('twitter:description', description);
    updateOrCreateMeta('twitter:image', image);

    // Update or create canonical link
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical || currentUrl);

    // Update or create JSON-LD schema
    let schemaScript = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'json-ld-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Samta Matrimony',
      description: description,
      provider: {
        '@type': 'Organization',
        name: 'Samta Matrimony Services Pvt. Ltd.',
        url: 'https://samta-matrimony.com',
        logo: 'https://samta-matrimony.com/logo.png',
        sameAs: [
          'https://facebook.com/samtamatrimony',
          'https://instagram.com/samtamatrimony',
        ],
      },
      areaServed: 'India',
    };
    schemaScript.innerHTML = JSON.stringify(schemaData);

    return () => {
      // Cleanup if needed
    };
  }, [title, description, keywords, image, currentUrl, canonical]);

  return null;
};

export default MetaSEO;