import type { MetadataRoute } from "next";
import {
  analyzePublicCombinationSeo,
  getPublicCombinationRoute,
} from "@/lib/public-combination-seo";
import { prisma } from "@/lib/prisma";
import { SITEMAP_PATHS, getSitemapEntries } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let publicCombinations: Array<{
    publicSlug: string;
    description: string | null;
    layoutJson: unknown;
    visibility: string;
  }> = [];

  try {
    publicCombinations = await prisma.savedCombination.findMany({
      where: {
        visibility: "PUBLIC",
      },
      select: {
        publicSlug: true,
        description: true,
        layoutJson: true,
        visibility: true,
      },
    });
  } catch (error) {
    console.error("[sitemap] failed to load public combinations", error);
  }

  const comboPaths = publicCombinations
    .filter((combination) => analyzePublicCombinationSeo(combination).isIndexable)
    .map((combination) => getPublicCombinationRoute(combination.publicSlug));

  return getSitemapEntries(new Date(), [...SITEMAP_PATHS, ...comboPaths]);
}
