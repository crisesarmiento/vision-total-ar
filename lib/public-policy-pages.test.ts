import { afterEach, describe, expect, it } from "vitest";
import {
  PUBLIC_POLICY_LINKS,
  PUBLIC_POLICY_PAGES,
  PUBLIC_POLICY_PATHS,
  getPublicPolicyPage,
} from "@/lib/public-policy-pages";
import { getPublicPolicyMetadata } from "@/lib/public-policy-metadata";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});

describe("public policy pages", () => {
  it("defines the trust page route set", () => {
    expect(PUBLIC_POLICY_PATHS).toEqual([
      "/acerca-de",
      "/contacto",
      "/privacidad",
      "/terminos",
      "/politica-editorial",
    ]);
    expect(new Set(PUBLIC_POLICY_PATHS).size).toBe(PUBLIC_POLICY_PATHS.length);
  });

  it("keeps footer labels mapped to public routes", () => {
    expect(PUBLIC_POLICY_LINKS).toEqual(
      PUBLIC_POLICY_PAGES.map((page) => ({
        href: page.path,
        label: page.navLabel,
      })),
    );
  });

  it("includes the required public-safe privacy and ownership copy", () => {
    const privacyCopy = getPublicPolicyPage("privacidad")?.sections.flatMap((section) => section.body).join(" ");
    const termsCopy = getPublicPolicyPage("terminos")?.sections.flatMap((section) => section.body).join(" ");

    expect(privacyCopy).toContain("NEXT_PUBLIC_ENABLE_WEB_ANALYTICS");
    expect(privacyCopy).toContain("AdSense");
    expect(privacyCopy).toContain("cookies");
    expect(termsCopy).toContain("Las señales, marcas, logos, embeds, reproductores y broadcasts pertenecen");
  });

  it("builds stable canonical metadata for policy pages", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://vision.example";

    const metadata = getPublicPolicyMetadata("contacto");

    expect(metadata.title).toEqual({
      absolute: "Contacto | Vision AR",
    });
    expect(metadata.alternates?.canonical).toBe("https://vision.example/contacto");
    expect(metadata.openGraph).toMatchObject({
      locale: "es_AR",
      siteName: "Vision AR",
      url: "https://vision.example/contacto",
    });
  });
});
