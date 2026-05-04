import { unstable_cache } from "next/cache";
import Parser from "rss-parser";

export type TickerItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
};

const parser = new Parser();

const feeds = [
  {
    name: "TN",
    url: "https://tn.com.ar/rss/",
  },
  {
    name: "Infobae",
    url: "https://www.infobae.com/feeds/rss/",
  },
  {
    name: "La Nación",
    url: "https://www.lanacion.com.ar/arc/outboundfeeds/rss/",
  },
  {
    name: "Clarín",
    url: "https://www.clarin.com/rss/lo-ultimo/",
  },
  {
    name: "Perfil",
    url: "https://www.perfil.com/feed/",
  },
];

export const getTickerItems = unstable_cache(
  async (): Promise<TickerItem[]> => {
    const items = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const parsed = await parser.parseURL(feed.url);

          return (parsed.items ?? []).slice(0, 3).map((item) => ({
            id: `${feed.name}-${item.guid ?? item.link ?? item.title}`,
            title: item.title ?? "Titular sin título",
            link: item.link ?? "#",
            source: feed.name,
            publishedAt: item.isoDate ?? new Date().toISOString(),
          }));
        } catch {
          return [];
        }
      }),
    );

    return items
      .flat()
      .sort(
        (left, right) =>
          new Date(right.publishedAt).getTime() -
          new Date(left.publishedAt).getTime(),
      )
      .slice(0, 15);
  },
  ["vision-ar-ticker"],
  {
    revalidate: 300,
    tags: ["ticker"],
  },
);
