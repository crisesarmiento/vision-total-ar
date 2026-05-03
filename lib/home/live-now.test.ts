import { describe, expect, it } from "vitest";
import {
  rankLiveChannels,
  rankRelevantCombos,
  scoreCombo,
} from "@/lib/home/live-now";
import type { NewsChannel } from "@/lib/channels";
import type { LiveChannelSnapshot } from "@/lib/youtube";

const FAKE_NOW = new Date("2026-01-15T12:00:00Z");

function makeChannel(id: string, extra?: Partial<NewsChannel>): NewsChannel {
  return {
    id,
    name: id.toUpperCase(),
    shortName: id.toUpperCase(),
    channelId: `UC_${id}`,
    liveUrl: "",
    category: "noticias",
    accent: "#ffffff",
    description: "",
    ...extra,
  };
}

function makeSnapshot(isLive: boolean, viewerCount: number | null = null): LiveChannelSnapshot {
  return {
    channelId: "UC_any",
    isLive,
    viewerCount,
    title: null,
    thumbnailUrl: null,
    startedAt: null,
  };
}

type ComboCandidate = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  favoritesCount: number;
  layoutJson: unknown;
  updatedAt: Date;
};

function makeCombo(overrides: Partial<ComboCandidate> & { layoutChannelIds?: string[] }): ComboCandidate {
  const { layoutChannelIds = [], ...rest } = overrides;
  return {
    id: "combo-a",
    publicSlug: "combo-a",
    name: "Combo A",
    description: null,
    favoritesCount: 0,
    updatedAt: FAKE_NOW,
    layoutJson: {
      preset: "2x1",
      players: layoutChannelIds.map((channelId, i) => ({
        slotId: `s${i}`,
        channelId,
        muted: true,
        volume: 50,
      })),
    },
    ...rest,
  };
}

describe("rankLiveChannels", () => {
  it("returns only channels that are live", () => {
    const chList = [makeChannel("tn"), makeChannel("c5n")];
    const snapshots = {
      tn: makeSnapshot(true, 1000),
      c5n: makeSnapshot(false),
    };
    const result = rankLiveChannels(chList, snapshots);
    expect(result.map((r) => r.id)).toEqual(["tn"]);
  });

  it("sorts live channels by viewerCount descending", () => {
    const chList = [makeChannel("tn"), makeChannel("c5n"), makeChannel("a24")];
    const snapshots = {
      tn: makeSnapshot(true, 500),
      c5n: makeSnapshot(true, 2000),
      a24: makeSnapshot(true, 800),
    };
    const result = rankLiveChannels(chList, snapshots);
    expect(result.map((r) => r.id)).toEqual(["c5n", "a24", "tn"]);
  });

  it("treats null viewerCount as 0 when sorting", () => {
    const chList = [makeChannel("tn"), makeChannel("c5n")];
    const snapshots = {
      tn: makeSnapshot(true, null),
      c5n: makeSnapshot(true, 100),
    };
    const result = rankLiveChannels(chList, snapshots);
    expect(result[0].id).toBe("c5n");
  });

  it("returns empty array when no channels are live", () => {
    const chList = [makeChannel("tn")];
    const snapshots = { tn: makeSnapshot(false) };
    expect(rankLiveChannels(chList, snapshots)).toEqual([]);
  });

  it("returns empty array for empty inputs", () => {
    expect(rankLiveChannels([], {})).toEqual([]);
  });

  it("maps viewerCount and accent from source data", () => {
    const chList = [makeChannel("tn", { accent: "#2563eb" })];
    const snapshots = { tn: makeSnapshot(true, 42) };
    const result = rankLiveChannels(chList, snapshots);
    expect(result[0].accent).toBe("#2563eb");
    expect(result[0].viewerCount).toBe(42);
  });
});

describe("rankRelevantCombos", () => {
  const liveIds = new Set(["tn", "c5n"]);

  it("ranks combo with more live channels higher", () => {
    const twoLive = makeCombo({ id: "two", publicSlug: "two", layoutChannelIds: ["tn", "c5n"] });
    const oneLive = makeCombo({ id: "one", publicSlug: "one", layoutChannelIds: ["tn", "olga"] });
    const result = rankRelevantCombos([oneLive, twoLive], liveIds, FAKE_NOW);
    expect(result[0].id).toBe("two");
  });

  it("counts liveChannelCount and totalChannelCount correctly", () => {
    const combo = makeCombo({ layoutChannelIds: ["tn", "olga", "a24"] });
    const result = rankRelevantCombos([combo], liveIds, FAKE_NOW);
    expect(result[0].liveChannelCount).toBe(1);
    expect(result[0].totalChannelCount).toBe(3);
  });

  it("handles malformed layoutJson without throwing, treating liveChannelCount as 0", () => {
    const combo = makeCombo({ layoutJson: "not-valid" });
    expect(() => rankRelevantCombos([combo], liveIds, FAKE_NOW)).not.toThrow();
    expect(rankRelevantCombos([combo], liveIds, FAKE_NOW)[0].liveChannelCount).toBe(0);
  });

  it("handles null layoutJson without throwing", () => {
    const combo = makeCombo({ layoutJson: null });
    expect(() => rankRelevantCombos([combo], liveIds, FAKE_NOW)).not.toThrow();
  });

  it("returns empty array for empty input", () => {
    expect(rankRelevantCombos([], liveIds, FAKE_NOW)).toEqual([]);
  });

  it("preserves all required fields on returned items", () => {
    const combo = makeCombo({
      id: "x",
      publicSlug: "x-slug",
      name: "My Combo",
      description: "desc",
      favoritesCount: 5,
      layoutChannelIds: ["tn"],
    });
    const [result] = rankRelevantCombos([combo], liveIds, FAKE_NOW);
    expect(result).toMatchObject({
      id: "x",
      publicSlug: "x-slug",
      name: "My Combo",
      description: "desc",
      favoritesCount: 5,
      liveChannelCount: 1,
      totalChannelCount: 1,
    });
  });
});

describe("scoreCombo", () => {
  it("scores higher for more live channels", () => {
    const base = { favoritesCount: 0, updatedAt: FAKE_NOW };
    const s0 = scoreCombo({ ...base, liveChannelCount: 0 }, FAKE_NOW);
    const s2 = scoreCombo({ ...base, liveChannelCount: 2 }, FAKE_NOW);
    expect(s2).toBeGreaterThan(s0);
  });

  it("scores higher for more favorites", () => {
    const base = { liveChannelCount: 0, updatedAt: FAKE_NOW };
    const s0 = scoreCombo({ ...base, favoritesCount: 0 }, FAKE_NOW);
    const s100 = scoreCombo({ ...base, favoritesCount: 100 }, FAKE_NOW);
    expect(s100).toBeGreaterThan(s0);
  });

  it("scores higher for more recent updatedAt", () => {
    const base = { liveChannelCount: 0, favoritesCount: 0 };
    const recent = scoreCombo({ ...base, updatedAt: FAKE_NOW }, FAKE_NOW);
    const old = scoreCombo({ ...base, updatedAt: new Date("2025-01-01") }, FAKE_NOW);
    expect(recent).toBeGreaterThan(old);
  });
});
