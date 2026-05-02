import type { ChannelCategory, NewsChannel } from "@/lib/channels";

export type SidebarChannelFilter = "all" | "live" | "favorites" | ChannelCategory;

type LiveStateByChannel = Record<string, { isLive?: boolean } | undefined>;

type FilterSidebarChannelsInput = {
  channels: NewsChannel[];
  favoriteIds: string[];
  filter: SidebarChannelFilter;
  liveSnapshots: LiveStateByChannel;
  search: string;
};

export const SIDEBAR_CHANNEL_FILTERS: Array<{
  value: SidebarChannelFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "live", label: "En vivo" },
  { value: "favorites", label: "Favoritos" },
  { value: "noticias", label: "Noticias" },
  { value: "streaming", label: "Streaming" },
  { value: "tv", label: "TV" },
];

export function filterSidebarChannels({
  channels,
  favoriteIds,
  filter,
  liveSnapshots,
  search,
}: FilterSidebarChannelsInput) {
  const normalizedSearch = search.trim().toLowerCase();

  return channels
    .filter((channel) => {
      if (filter === "live" && !liveSnapshots[channel.id]?.isLive) {
        return false;
      }

      if (filter === "favorites" && !favoriteIds.includes(channel.id)) {
        return false;
      }

      if (
        (filter === "noticias" || filter === "streaming" || filter === "tv") &&
        channel.category !== filter
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return `${channel.name} ${channel.description}`.toLowerCase().includes(normalizedSearch);
    })
    .sort((left, right) => {
      const leftFavorite = favoriteIds.includes(left.id);
      const rightFavorite = favoriteIds.includes(right.id);

      if (leftFavorite === rightFavorite) {
        return 0;
      }

      return leftFavorite ? -1 : 1;
    });
}
