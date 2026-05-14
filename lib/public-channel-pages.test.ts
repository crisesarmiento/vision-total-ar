import { describe, expect, it } from "vitest";
import { channels } from "@/lib/channels";
import {
  getChannelsForCategory,
  getPublicCategories,
  getPublicCategoryBySlug,
  getPublicCategoryRoutes,
  getPublicChannelBySlug,
  getPublicChannelRoutes,
  getPublicChannelSitemapPaths,
  PUBLIC_CHANNEL_CATEGORIES,
} from "@/lib/public-channel-pages";

describe("public channel pages", () => {
  it("maps every catalog channel to a supported public category", () => {
    const supportedCategories = new Set(Object.keys(PUBLIC_CHANNEL_CATEGORIES));

    expect(channels.every((channel) => supportedCategories.has(channel.category))).toBe(true);
  });

  it("only exposes category pages with at least one channel", () => {
    const publicCategories = getPublicCategories();

    expect(publicCategories).toHaveLength(4);
    expect(publicCategories.map((category) => category.slug)).toEqual([
      "noticias",
      "streaming",
      "tv",
      "deportes",
    ]);
    expect(
      publicCategories.every((category) => getChannelsForCategory(category.slug).length > 0),
    ).toBe(true);
  });

  it("resolves public channels and categories by slug", () => {
    expect(getPublicChannelBySlug("tn")?.name).toBe("TN - Todo Noticias");
    expect(getPublicCategoryBySlug("noticias")?.title).toBe(
      "Canales de noticias argentinas en vivo",
    );
    expect(getPublicChannelBySlug("no-existe")).toBeUndefined();
    expect(getPublicCategoryBySlug("regional")).toBeUndefined();
  });

  it("generates unique public sitemap paths", () => {
    const paths = getPublicChannelSitemapPaths();

    expect(paths).toEqual(
      expect.arrayContaining([
        "/canales",
        "/canales/tn",
        "/canales/categoria/noticias",
      ]),
    );
    expect(paths).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("/api/"),
        expect.stringContaining("/combo/"),
        expect.stringContaining("/robots.txt"),
        expect.stringContaining("/sitemap.xml"),
      ]),
    );
    expect(new Set(paths).size).toBe(paths.length);
    expect(getPublicCategoryRoutes().every((path) => paths.includes(path))).toBe(true);
    expect(getPublicChannelRoutes().every((path) => paths.includes(path))).toBe(true);
  });
});
