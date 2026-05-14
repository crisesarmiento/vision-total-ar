import type { NewsChannel } from "@/lib/channels";
import type { EvergreenGuide } from "@/lib/evergreen-guides";
import { getEvergreenGuideRoute } from "@/lib/evergreen-guides";
import type { PublicChannelCategory } from "@/lib/public-channel-pages";
import {
  getPublicCategoryRoute,
  getPublicChannelRoute,
} from "@/lib/public-channel-pages";
import { getCanonicalUrl } from "@/lib/seo";

export const SITE_NAME = "Vision AR";
export const SITE_DESCRIPTION =
  "Multiview premium para seguir noticias argentinas en vivo, comparar señales y abrir combinaciones públicas desde una sola pantalla.";

type JsonPrimitive = string | number | boolean | null;
export type JsonLdValue = JsonPrimitive | JsonLdValue[] | { [key: string]: JsonLdValue };
export type JsonLdObject = { [key: string]: JsonLdValue };

export type BreadcrumbItem = {
  name: string;
  url: string;
};

const SCHEMA_CONTEXT = "https://schema.org";

function asAbsoluteUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : getCanonicalUrl(url);
}

function compactJsonLd(value: unknown): JsonLdValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => compactJsonLd(item))
      .filter((item): item is JsonLdValue => item !== undefined);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, compactJsonLd(item)] as const)
        .filter((entry): entry is readonly [string, JsonLdValue] => entry[1] !== undefined),
    );
  }

  return undefined;
}

export function serializeStructuredData(data: JsonLdObject | JsonLdObject[]) {
  const compacted = compactJsonLd(data);

  return JSON.stringify(compacted).replace(/</g, "\\u003c");
}

export function buildSiteIdentityStructuredData(): JsonLdObject[] {
  const siteUrl = getCanonicalUrl("/");
  const organizationId = `${siteUrl}#organization`;

  return [
    {
      "@context": SCHEMA_CONTEXT,
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: siteUrl,
      logo: getCanonicalUrl("/icon"),
      description: SITE_DESCRIPTION,
    },
    {
      "@context": SCHEMA_CONTEXT,
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: SITE_NAME,
      url: siteUrl,
      description: SITE_DESCRIPTION,
      inLanguage: "es-AR",
      publisher: {
        "@id": organizationId,
      },
    },
  ];
}

export function buildBreadcrumbStructuredData(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: asAbsoluteUrl(item.url),
    })),
  };
}

export function buildCategoryItemListStructuredData(
  categories: PublicChannelCategory[],
): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    name: "Categorías de señales argentinas en Vision AR",
    numberOfItems: categories.length,
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "WebPage",
        name: category.title,
        url: getCanonicalUrl(getPublicCategoryRoute(category)),
        description: category.description,
      },
    })),
  };
}

export function buildChannelItemListStructuredData(
  channels: NewsChannel[],
  name = "Canales argentinos en vivo en Vision AR",
): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    name,
    numberOfItems: channels.length,
    itemListElement: channels.map((channel, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "WebPage",
        name: channel.name,
        url: getCanonicalUrl(getPublicChannelRoute(channel)),
        description: channel.description,
      },
    })),
  };
}

export function buildEvergreenGuideItemListStructuredData(
  guides: EvergreenGuide[],
): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    name: "Guías de monitoreo de noticias argentinas en Vision AR",
    numberOfItems: guides.length,
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "WebPage",
        name: guide.title,
        url: getCanonicalUrl(getEvergreenGuideRoute(guide)),
        description: guide.description,
      },
    })),
  };
}

export function buildPublicCombinationChannelItemListStructuredData(
  channels: NewsChannel[],
  name: string,
): JsonLdObject {
  return buildChannelItemListStructuredData(channels, `Señales incluidas en ${name}`);
}
