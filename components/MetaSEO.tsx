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
  title = "Samta Matrimony - Trusted Partner Discovery", 
  description = "Join Samta Matrimony, the most trusted site to find your perfect life partner. We celebrate cultural values and modernize the matchmaking experience.",
  keywords = "matrimony, marriage, life partner, indian wedding, matchmaking, verified profiles",
  image = "https://samta-matrimony.com/og-image.jpg",
  canonical
}) => {
  const location = useLocation();
  const currentUrl = `https://samta-matrimony.com${location.pathname}${location.search}`;

  useEffect(() => {
    document.title = title;
    
    const updateMeta = (name: string, content: string, attr: string = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:url', currentUrl, 'property');
    updateMeta('og:type', 'website', 'property');
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);

    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical || currentUrl);

    let schemaScript = document.getElementById('json-ld-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'json-ld-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Samta Matrimony",
      "description": description,
      "provider": {
        "@type": "Organization",
        "name": "Samta Matrimony Services Pvt. Ltd.",
        "url": "https://samta-matrimony.com",
        "logo": "https://samta-matrimony.com/logo.png",
        "sameAs": [
          "https://facebook.com/samtamatrimony",
          "https://instagram.com/samtamatrimony"
        ]
      },
      "areaServed": "India"
    };
    schemaScript.innerHTML = JSON.stringify(schemaData);

  }, [title, description, keywords, image, currentUrl, canonical]);

  return null;
};

export default MetaSEO;