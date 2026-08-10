// Single source of truth for the canonical production origin.
// Never use window.location.origin for SEO/share URLs — preview and
// www hosts would leak into canonical tags and shared links, causing
// duplicate indexing in Google.
export const SITE_ORIGIN = "https://himsols.online";

/** Normalize a path: ensure leading slash, drop query/hash, drop trailing slash. */
export const normalizePath = (path: string): string => {
  let p = (path || "/").split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
};

/** Build an absolute himsols.online URL from a path or pass through absolute URLs. */
export const absoluteUrl = (pathOrUrl?: string): string => {
  if (pathOrUrl && /^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = normalizePath(pathOrUrl ?? "/");
  return path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
};

/** Canonical URL for the current route (query params intentionally excluded). */
export const canonicalUrl = (explicit?: string): string => {
  if (explicit) {
    // Strip query/hash even from explicitly supplied absolute URLs.
    try {
      const u = new URL(explicit, SITE_ORIGIN);
      return absoluteUrl(u.pathname);
    } catch {
      return absoluteUrl(explicit);
    }
  }
  if (typeof window !== "undefined") return absoluteUrl(window.location.pathname);
  return `${SITE_ORIGIN}/`;
};
