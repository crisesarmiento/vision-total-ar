import { afterEach, describe, expect, it } from "vitest";
import { channels } from "@/lib/channels";
import { getPublicCategories } from "@/lib/public-channel-pages";
import { analyzePublicCombinationSeo } from "@/lib/public-combination-seo";
import {
  buildBreadcrumbStructuredData,
  buildCategoryItemListStructuredData,
  buildChannelItemListStructuredData,
  buildPublicCombinationChannelItemListStructuredData,
  buildSiteIdentityStructuredData,
  serializeStructuredData,
  type JsonLdObject,
  type JsonLdValue,
} from "@/lib/structured-data";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});

function collectTypes(value: JsonLdValue): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectTypes);
  }

  if (value && typeof value === "object") {
    const currentType = typeof value["@type"] === "string" ? [value["@type"]] : [];

    return [
      ...currentType,
      ...Object.values(value).flatMap((item) => collectTypes(item)),
    ];
  }

  return [];
}

describe("structured data builders", () => {
  it("builds minimal site identity JSON-LD with absolute public URLs", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://vision.example";

    const data = buildSiteIdentityStructuredData();

    expect(data.map((item) => item["@type"])).toEqual(["Organization", "WebSite"]);
    expect(data[0]).toMatchObject({
      name: "Vision AR",
      url: "https://vision.example/",
      logo: "https://vision.example/icon",
    });
    expect(JSON.parse(serializeStructuredData(data))).toEqual(data);
  });

  it("builds breadcrumb positions with absolute URLs", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://vision.example";

    const data = buildBreadcrumbStructuredData([
      { name: "Inicio", url: "/" },
      { name: "Canales", url: "/canales" },
      { name: "Noticias", url: "/canales/categoria/noticias" },
    ]);

    expect(data).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "Inicio", item: "https://vision.example/" },
        { position: 2, name: "Canales", item: "https://vision.example/canales" },
        {
          position: 3,
          name: "Noticias",
          item: "https://vision.example/canales/categoria/noticias",
        },
      ],
    });
  });

  it("builds category and channel item lists without video ownership claims", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://vision.example";

    const categoryList = buildCategoryItemListStructuredData(getPublicCategories());
    const channelList = buildChannelItemListStructuredData(channels.slice(0, 2));
    const serialized = JSON.parse(serializeStructuredData([categoryList, channelList]));

    expect(categoryList).toMatchObject({
      "@type": "ItemList",
      numberOfItems: 4,
    });
    const channelListItems = channelList.itemListElement as JsonLdObject[];

    expect(channelList).toMatchObject({
      "@type": "ItemList",
      numberOfItems: 2,
    });
    expect(channelListItems[0]).toMatchObject({
      position: 1,
      item: expect.objectContaining({
        "@type": "WebPage",
        url: "https://vision.example/canales/tn",
      }),
    });
    expect(collectTypes(serialized)).not.toContain("VideoObject");
  });

  it("builds public combination item lists from catalog-backed channels only", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://vision.example";
    const summary = analyzePublicCombinationSeo({
      visibility: "PUBLIC",
      description:
        "Mesa pública con señales de noticias argentinas para comparar agenda, ritmo de cobertura y enfoques editoriales en vivo.",
      layoutJson: {
        preset: "2x2",
        players: [
          { slotId: "slot-1", channelId: "tn" },
          { slotId: "slot-2", channelId: "c5n" },
          { slotId: "slot-3", channelId: "lnmas" },
          { slotId: "slot-4", channelId: "missing-channel" },
        ].map((player) => ({
          ...player,
          muted: true,
          volume: 0,
        })),
      },
    });

    const data = buildPublicCombinationChannelItemListStructuredData(
      summary.uniqueChannels,
      "Mesa de noticias",
    );

    expect(data).toMatchObject({
      "@type": "ItemList",
      name: "Señales incluidas en Mesa de noticias",
      numberOfItems: 3,
    });
    expect(collectTypes(data)).not.toContain("VideoObject");
  });

  it("omits undefined values and escapes script-breaking characters", () => {
    const serialized = serializeStructuredData({
      "@context": "https://schema.org",
      "@type": "Thing",
      name: "Vision <AR>",
      missing: undefined,
    } as unknown as JsonLdObject);

    expect(serialized).toContain("Vision \\u003cAR>");
    expect(serialized).not.toContain("missing");
    expect(JSON.parse(serialized)).toMatchObject({
      "@type": "Thing",
      name: "Vision <AR>",
    });
  });
});
