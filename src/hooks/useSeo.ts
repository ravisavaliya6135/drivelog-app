import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export function useSeo({ title, description, canonicalUrl, noindex = false }: SeoProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      } else {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        metaDesc.setAttribute('content', description);
        document.head.appendChild(metaDesc);
      }
    }

    // Update canonical link
    if (canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (linkCanonical) {
        linkCanonical.setAttribute('href', canonicalUrl);
      }
    }

    // Update robots noindex for private routes
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (metaRobots) {
        metaRobots.setAttribute('content', 'noindex, nofollow');
      } else {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        metaRobots.setAttribute('content', 'noindex, nofollow');
        document.head.appendChild(metaRobots);
      }
    } else {
      if (metaRobots) {
        metaRobots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      }
    }
  }, [title, description, canonicalUrl, noindex]);
}
