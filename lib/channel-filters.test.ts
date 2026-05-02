import { describe, expect, it } from "vitest";
import { filterSidebarChannels } from "@/lib/channel-filters";
import { channels } from "@/lib/channels";

describe("filterSidebarChannels", () => {
  it("reduces the list to live channels", () => {
    const result = filterSidebarChannels({
      channels,
      favoriteIds: [],
      filter: "live",
      liveSnapshots: {
        tn: { isLive: true },
        c5n: { isLive: false },
        olga: { isLive: true },
      },
      search: "",
    });

    expect(result.map((channel) => channel.id)).toEqual(["tn", "olga"]);
  });

  it("reduces the list to favorite channels", () => {
    const result = filterSidebarChannels({
      channels,
      favoriteIds: ["cronica", "tn"],
      filter: "favorites",
      liveSnapshots: {},
      search: "",
    });

    expect(result.map((channel) => channel.id)).toEqual(["tn", "cronica"]);
  });

  it("filters by category", () => {
    const result = filterSidebarChannels({
      channels,
      favoriteIds: [],
      filter: "streaming",
      liveSnapshots: {},
      search: "",
    });

    expect(result.every((channel) => channel.category === "streaming")).toBe(true);
    expect(result.map((channel) => channel.id)).toEqual(["luzu", "olga", "bondi", "blender"]);
  });

  it("composes category filters with search", () => {
    const result = filterSidebarChannels({
      channels,
      favoriteIds: [],
      filter: "streaming",
      liveSnapshots: {},
      search: "agenda",
    });

    expect(result.map((channel) => channel.id)).toEqual(["olga"]);
  });

  it("keeps favorites first inside the filtered result set", () => {
    const result = filterSidebarChannels({
      channels,
      favoriteIds: ["cronica"],
      filter: "noticias",
      liveSnapshots: {},
      search: "",
    });

    expect(result[0]?.id).toBe("cronica");
    expect(result.every((channel) => channel.category === "noticias")).toBe(true);
  });

  it("returns an empty list when no channel matches the filter and search", () => {
    const result = filterSidebarChannels({
      channels,
      favoriteIds: [],
      filter: "tv",
      liveSnapshots: {},
      search: "streaming independiente",
    });

    expect(result).toEqual([]);
  });
});
