import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  noindex?: boolean;
}

// JSON-LD Schemas
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Himsols",
  "alternateName": "हिमसोल्स",
  "url": "https://himsols.com",
  "logo": "https://himsols.com/favicon.png",
  "description": "Himsols provides tree plantation, waste management, and conservation services for rural communities in Himachal Pradesh. पर्यावरण संरक्षण के लिए हमसे जुड़ें।",
  "foundingDate": "2024",
  "areaServed": {
    "@type": "Place",
    "name": "Himachal Pradesh, India"
  },
  "sameAs": [
    "https://wa.me/919876543210"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["English", "Hindi"]
  }
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Himsols",
  "@id": "https://himsols.com",
  "url": "https://himsols.com",
  "image": "https://himsols.com/favicon.png",
  "description": "Tree plantation, waste management, and eco-friendly products for Himachal Pradesh communities",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "Himachal Pradesh",
    "addressCountry": "IN"
  },
  "priceRange": "₹₹",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "18:00"
  }
};

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Himsols Services",
  "itemListElement": [
    {
      "@type": "Service",
      "position": 1,
      "name": "Tree Plantation",
      "description": "Professional tree plantation services for homes, farms, and communities in Himachal Pradesh",
      "provider": {
        "@type": "Organization",
        "name": "Himsols"
      },
      "areaServed": "Himachal Pradesh, India",
      "serviceType": "Environmental Conservation"
    },
    {
      "@type": "Service",
      "position": 2,
      "name": "Waste Management",
      "description": "Scrap pickup and recycling services - we collect electronic waste, metal, paper, and plastic",
      "provider": {
        "@type": "Organization",
        "name": "Himsols"
      },
      "areaServed": "Himachal Pradesh, India",
      "serviceType": "Waste Collection"
    },
    {
      "@type": "Service",
      "position": 3,
      "name": "Rural Marketplace",
      "description": "Buy fresh farmer produce, handmade products, and plants directly from rural Himachal communities",
      "provider": {
        "@type": "Organization",
        "name": "Himsols"
      },
      "areaServed": "India",
      "serviceType": "E-commerce"
    }
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Himsols",
  "url": "https://himsols.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://himsols.com/blog?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const SITE_ORIGIN = "https://himsols.com";

const resolveCanonicalUrl = (explicit?: string) => {
  if (explicit) return explicit;
  if (typeof window !== "undefined") {
    return `${SITE_ORIGIN}${window.location.pathname}${window.location.search || ""}`;
  }
  return `${SITE_ORIGIN}/`;
};

export const SEO = ({
  title = "Himsols — पर्यावरण समाधान | Environmental Solutions",
  description = "Himsols - Tree plantation, waste management, and conservation services for rural communities in Himachal Pradesh. पर्यावरण संरक्षण के लिए हमसे जुड़ें।",
  keywords = "tree plantation, waste management, scrap pickup, eco-friendly, Himachal Pradesh, पेड़ लगाओ, कबाड़ बेचो, पर्यावरण",
  image = "https://himsols.com/pwa-512x512.png",
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  section,
  noindex = false,
}: SEOProps) => {
  const canonicalUrl = resolveCanonicalUrl(url);

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author || 'Himsols');
    
    // Robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Himsols', true);
    updateMetaTag('og:locale', 'en_IN', true);
    updateMetaTag('og:locale:alternate', 'hi_IN', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@Himsols');

    // Article specific tags
    if (type === 'article') {
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
      if (section) updateMetaTag('article:section', section, true);
      if (author) updateMetaTag('article:author', author, true);
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

  }, [title, description, keywords, image, canonicalUrl, type, author, publishedTime, modifiedTime, section, noindex]);

  return null;
};

// Component to inject JSON-LD schemas
export const SEOSchemas = ({ includeServices = false }: { includeServices?: boolean }) => {
  useEffect(() => {
    // Remove existing schema scripts
    document.querySelectorAll('script[data-schema="himsols"]').forEach(el => el.remove());

    // Add organization schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.setAttribute('data-schema', 'himsols');
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Add local business schema
    const bizScript = document.createElement('script');
    bizScript.type = 'application/ld+json';
    bizScript.setAttribute('data-schema', 'himsols');
    bizScript.textContent = JSON.stringify(localBusinessSchema);
    document.head.appendChild(bizScript);

    // Add website schema
    const webScript = document.createElement('script');
    webScript.type = 'application/ld+json';
    webScript.setAttribute('data-schema', 'himsols');
    webScript.textContent = JSON.stringify(websiteSchema);
    document.head.appendChild(webScript);

    // Add services schema if requested
    if (includeServices) {
      const svcScript = document.createElement('script');
      svcScript.type = 'application/ld+json';
      svcScript.setAttribute('data-schema', 'himsols');
      svcScript.textContent = JSON.stringify(servicesSchema);
      document.head.appendChild(svcScript);
    }

    return () => {
      document.querySelectorAll('script[data-schema="himsols"]').forEach(el => el.remove());
    };
  }, [includeServices]);

  return null;
};

// Blog post specific schema
export const BlogPostSchema = ({ 
  title, 
  description, 
  image, 
  url, 
  author, 
  publishedTime, 
  modifiedTime,
  category 
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  category?: string;
}) => {
  useEffect(() => {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": image || "https://himsols.com/pwa-512x512.png",
      "url": url,
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "author": {
        "@type": "Person",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Himsols",
        "logo": {
          "@type": "ImageObject",
          "url": "https://himsols.com/favicon.png"
        }
      },
      "articleSection": category,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      }
    };

    // Remove existing article schema
    document.querySelectorAll('script[data-schema="article"]').forEach(el => el.remove());

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'article');
    script.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="article"]').forEach(el => el.remove());
    };
  }, [title, description, image, url, author, publishedTime, modifiedTime, category]);

  return null;
};

// Product schema for marketplace
export const ProductSchema = ({
  name,
  description,
  image,
  price,
  currency = 'INR',
  availability = 'InStock',
  url
}: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
}) => {
  useEffect(() => {
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": name,
      "description": description,
      "image": image,
      "url": url,
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": currency,
        "availability": `https://schema.org/${availability}`,
        "seller": {
          "@type": "Organization",
          "name": "Himsols"
        }
      }
    };

    document.querySelectorAll('script[data-schema="product"]').forEach(el => el.remove());

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'product');
    script.textContent = JSON.stringify(productSchema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="product"]').forEach(el => el.remove());
    };
  }, [name, description, image, price, currency, availability, url]);

  return null;
};

// Collection / listing page schema (marketplace, plants, blog, gallery)
export const CollectionPageSchema = ({
  name,
  description,
  url,
  items,
  itemType = 'Thing',
}: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url?: string; image?: string; price?: number }>;
  itemType?: 'Product' | 'Article' | 'ImageObject' | 'Thing';
}) => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": name,
      "description": description,
      "url": url,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": items.length,
        "itemListElement": items.slice(0, 30).map((it, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": itemType,
            "name": it.name,
            ...(it.url ? { "url": it.url } : {}),
            ...(it.image ? { "image": it.image } : {}),
            ...(it.price != null
              ? { "offers": { "@type": "Offer", "price": it.price, "priceCurrency": "INR" } }
              : {}),
          },
        })),
      },
    };

    document.querySelectorAll('script[data-schema="collection"]').forEach(el => el.remove());
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'collection');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="collection"]').forEach(el => el.remove());
    };
  }, [name, description, url, items, itemType]);

  return null;
};

export default SEO;
