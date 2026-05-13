import { parseDashboardLayout, type DashboardLayout } from "@/lib/dashboard-layout";
import { getChannelById, type ChannelCategory, type NewsChannel } from "@/lib/channels";
import {
  PUBLIC_CHANNEL_CATEGORIES,
  getPublicCategoryRoute,
  getPublicChannelRoute,
} from "@/lib/public-channel-pages";

export const PUBLIC_COMBINATION_MIN_DESCRIPTION_LENGTH = 80;
export const PUBLIC_COMBINATION_MIN_UNIQUE_CHANNELS = 3;

type PublicCombinationSeoInput = {
  visibility: string;
  description: string | null;
  layoutJson: unknown;
};

export type PublicCombinationSeoSummary = {
  isIndexable: boolean;
  layout: DashboardLayout | null;
  channels: NewsChannel[];
  uniqueChannels: NewsChannel[];
  categories: Array<{
    slug: ChannelCategory;
    label: string;
    route: string;
  }>;
  missingChannelIds: string[];
  description: string;
  reasons: string[];
};

export function analyzePublicCombinationSeo(
  combination: PublicCombinationSeoInput,
): PublicCombinationSeoSummary {
  const reasons: string[] = [];
  const description = combination.description?.trim() ?? "";

  if (combination.visibility !== "PUBLIC") {
    reasons.push("not-public");
  }

  if (description.length < PUBLIC_COMBINATION_MIN_DESCRIPTION_LENGTH) {
    reasons.push("description-too-short");
  }

  const layout = parseDashboardLayout(combination.layoutJson);

  if (!layout) {
    reasons.push("invalid-layout");

    return {
      isIndexable: false,
      layout: null,
      channels: [],
      uniqueChannels: [],
      categories: [],
      missingChannelIds: [],
      description,
      reasons,
    };
  }

  const missingChannelIds: string[] = [];
  const channels = layout.players.flatMap((player) => {
    const channel = getChannelById(player.channelId);

    if (!channel) {
      missingChannelIds.push(player.channelId);
      return [];
    }

    return [channel];
  });

  if (missingChannelIds.length > 0) {
    reasons.push("missing-channels");
  }

  const uniqueChannels = Array.from(
    new Map(channels.map((channel) => [channel.id, channel])).values(),
  );

  if (uniqueChannels.length < PUBLIC_COMBINATION_MIN_UNIQUE_CHANNELS) {
    reasons.push("not-enough-unique-channels");
  }

  const categories = Array.from(
    new Set(uniqueChannels.map((channel) => channel.category)),
  ).map((slug) => {
    const category = PUBLIC_CHANNEL_CATEGORIES[slug];

    return {
      slug,
      label: category.label,
      route: getPublicCategoryRoute(category),
    };
  });

  return {
    isIndexable: reasons.length === 0,
    layout,
    channels,
    uniqueChannels,
    categories,
    missingChannelIds,
    description,
    reasons,
  };
}

export function getPublicCombinationRoute(publicSlug: string) {
  return `/combo/${publicSlug}`;
}

export function getPublicCombinationChannelRoute(channel: NewsChannel) {
  return getPublicChannelRoute(channel);
}
