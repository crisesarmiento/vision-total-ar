import type { MetadataRoute } from "next";
import { getPublicChannelSitemapPaths } from "@/lib/public-channel-pages";
import { PUBLIC_POLICY_PATHS } from "@/lib/public-policy-pages";

const DEFAULT_APP_URL = "http://localhost:3000";

export const SITEMAP_PATHS = [
  "/",
  ...getPublicChannelSitemapPaths(),
  ...PUBLIC_POLICY_PATHS,
];

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_APP_URL;
  const normalizedUrl = configuredUrl.replace(/\/+$/, "");

  return normalizedUrl || DEFAULT_APP_URL;
}

export function getCanonicalUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return new URL(normalizedPath, `${getSiteUrl()}/`).toString();
}

export function getSitemapEntries(
  lastModified = new Date(),
  paths = SITEMAP_PATHS,
): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: getCanonicalUrl(path),
    lastModified,
  }));
}
