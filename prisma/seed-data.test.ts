import { describe, expect, it } from "vitest";
import { channels } from "../lib/channels";
import { dashboardLayoutSchema } from "../lib/dashboard-layout";
import { GRID_PRESETS } from "../lib/layout-presets";
import {
  expectedSeedFavoriteCounts,
  seedChannelAnalytics,
  seedCombinations,
  seedFavoriteChannels,
  seedFavoriteCombinations,
  seedPreference,
  seedRecentCombinations,
} from "./seed-data";

const channelIds = new Set(channels.map((channel) => channel.id));
const presetIds = new Set(GRID_PRESETS.map((preset) => preset.id));

describe("local seed data", () => {
  it("uses only channel ids from the catalog", () => {
    const usedChannelIds = new Set([
      ...seedFavoriteChannels.map((favorite) => favorite.channelId),
      ...seedChannelAnalytics.map((analytics) => analytics.channelId),
      ...seedPreference.defaultLayoutJson.players.map(
        (player) => player.channelId,
      ),
      ...seedCombinations.flatMap((combination) =>
        combination.layoutJson.players.map((player) => player.channelId),
      ),
    ]);

    expect([...usedChannelIds].sort()).toEqual(
      [...usedChannelIds].filter((channelId) => channelIds.has(channelId)).sort(),
    );
  });

  it("defines valid dashboard layouts and slot ids", () => {
    const layouts = [
      seedPreference.defaultLayoutJson,
      ...seedCombinations.map((combination) => combination.layoutJson),
    ];

    for (const layout of layouts) {
      expect(dashboardLayoutSchema.safeParse(layout).success).toBe(true);
      expect(presetIds.has(layout.preset)).toBe(true);

      layout.players.forEach((player, index) => {
        expect(player.slotId).toBe(`slot-${index + 1}`);
      });
    }
  });

  it("keeps seeded favorite counts consistent with favorited rows", () => {
    expect(expectedSeedFavoriteCounts()).toEqual({
      "demo-mesa-de-noticias": 2,
      "demo-modo-elecciones": 2,
      "demo-streaming-independiente": 1,
    });
  });

  it("references only seeded public combinations from engagement rows", () => {
    const publicSlugs = new Set(
      seedCombinations
        .filter((combination) => combination.visibility === "PUBLIC")
        .map((combination) => combination.publicSlug),
    );

    for (const favorite of seedFavoriteCombinations) {
      expect(publicSlugs.has(favorite.combinationSlug)).toBe(true);
    }

    for (const recent of seedRecentCombinations) {
      expect(publicSlugs.has(recent.combinationSlug)).toBe(true);
    }
  });
});
