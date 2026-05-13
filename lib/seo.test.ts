import { afterEach, describe, expect, it } from "vitest";
import { getCanonicalUrl, getSiteUrl, getSitemapEntries } from "./seo";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});

describe("SEO URL helpers", () => {
  it("falls back to the local app URL", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(getSiteUrl()).toBe("http://localhost:3000");
    expect(getCanonicalUrl("/")).toBe("http://localhost:3000/");
  });

  it("normalizes configured app URLs with trailing slashes", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://vision.example///";

    expect(getSiteUrl()).toBe("https://vision.example");
    expect(getCanonicalUrl("/combo/mesa-de-noticias")).toBe(
      "https://vision.example/combo/mesa-de-noticias",
    );
  });

  it("builds a homepage-only sitemap for current acquisition surfaces", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://vision.example/";
    const urls = getSitemapEntries(new Date("2026-05-13T00:00:00.000Z")).map(
      (entry) => entry.url,
    );

    expect(urls).toEqual(["https://vision.example/"]);
    expect(urls).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("/ingresar"),
        expect.stringContaining("/registrarse"),
        expect.stringContaining("/perfil"),
        expect.stringContaining("/configuracion"),
        expect.stringContaining("/mis-combinaciones"),
        expect.stringContaining("/api/"),
        expect.stringContaining("/robots.txt"),
        expect.stringContaining("/sitemap.xml"),
      ]),
    );
  });
});
