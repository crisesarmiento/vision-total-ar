import type { MetadataRoute } from "next";

const DEFAULT_APP_URL = "http://localhost:3000";

export const SITEMAP_PATHS = ["/"] as const;

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_APP_URL;
  const normalizedUrl = configuredUrl.replace(/\/+$/, "");

  return normalizedUrl || DEFAULT_APP_URL;
}

export function getCanonicalUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return new URL(normalizedPath, `${getSiteUrl()}/`).toString();
}

export function getSitemapEntries(lastModified = new Date()): MetadataRoute.Sitemap {
  return SITEMAP_PATHS.map((path) => ({
    url: getCanonicalUrl(path),
    lastModified,
  }));
}
