import { useEffect } from 'react';

const SITE_URL = 'https://drivehours.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SeoProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  /** Social share image; defaults to the DriveLog card */
  ogImage?: string;
}

/** Finds (or creates) a meta tag and sets its content. */
function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function useSeo({ title, description, canonicalUrl, noindex = false, ogImage = DEFAULT_OG_IMAGE }: SeoProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    const descriptionOrFallback = description ?? title;

    // Update meta description
    setMeta('name', 'description', descriptionOrFallback);

    // Update canonical link
    if (canonicalUrl) {
      const linkCanonical = document.querySelector('link[rel="canonical"]');
      if (linkCanonical) {
        linkCanonical.setAttribute('href', canonicalUrl);
      }
    }

    // Update robots noindex for private routes
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else if (metaRobots) {
      metaRobots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // Open Graph tags — kept in sync across SPA route navigations
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', descriptionOrFallback);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:url', canonicalUrl ?? SITE_URL);

    // Twitter Card tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', descriptionOrFallback);
    setMeta('name', 'twitter:image', ogImage);
    setMeta('name', 'twitter:url', canonicalUrl ?? SITE_URL);
  }, [title, description, canonicalUrl, noindex, ogImage]);
}
