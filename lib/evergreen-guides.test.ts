import { describe, expect, it } from "vitest";
import {
  EVERGREEN_GUIDES,
  EVERGREEN_GUIDES_INDEX_PATH,
  getEvergreenGuideBySlug,
  getEvergreenGuidePaths,
  getEvergreenGuideSitemapPaths,
  getEvergreenGuides,
} from "@/lib/evergreen-guides";

describe("evergreen guides", () => {
  it("publishes the CRIS-300 guide set", () => {
    expect(getEvergreenGuides()).toHaveLength(4);
    expect(getEvergreenGuides().map((guide) => guide.slug)).toEqual([
      "seguir-ultimo-momento-argentina",
      "comparar-cobertura-en-vivo",
      "combinaciones-publicas",
      "uso-responsable-fuentes-en-vivo",
    ]);
  });

  it("resolves guides by slug", () => {
    expect(getEvergreenGuideBySlug("comparar-cobertura-en-vivo")?.title).toContain(
      "comparar cobertura",
    );
    expect(getEvergreenGuideBySlug("no-existe")).toBeUndefined();
  });

  it("generates unique public guide paths", () => {
    const paths = getEvergreenGuidePaths();

    expect(paths).toEqual([
      "/guias/seguir-ultimo-momento-argentina",
      "/guias/comparar-cobertura-en-vivo",
      "/guias/combinaciones-publicas",
      "/guias/uso-responsable-fuentes-en-vivo",
    ]);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((path) => path.startsWith("/guias/"))).toBe(true);
  });

  it("includes index and detail pages in sitemap paths", () => {
    expect(getEvergreenGuideSitemapPaths()).toEqual([
      EVERGREEN_GUIDES_INDEX_PATH,
      ...getEvergreenGuidePaths(),
    ]);
  });

  it("keeps every guide useful and internally linked", () => {
    expect(
      EVERGREEN_GUIDES.every(
        (guide) =>
          guide.description.length > 80 &&
          guide.sections.length >= 3 &&
          guide.sections.every((section) => section.body.length >= 2) &&
          guide.relatedLinks.some((link) => link.href.startsWith("/canales")) &&
          [guide.primaryCta.href, guide.secondaryCta.href].some((href) => href === "/"),
      ),
    ).toBe(true);
  });
});
