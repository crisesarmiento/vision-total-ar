import { describe, expect, it } from "vitest";
import { detectLiveTransitions } from "./live-alerts";
import type { LiveChannelSnapshot } from "./youtube";

function snap(isLive: boolean, startedAt: string | null = null): LiveChannelSnapshot {
  return {
    channelId: "test",
    isLive,
    viewerCount: null,
    title: null,
    thumbnailUrl: null,
    startedAt,
  };
}

const LIVE = snap(true, "2026-01-01T09:00:00Z");
const NOT_LIVE = snap(false);

describe("detectLiveTransitions", () => {
  it("returns empty array when favoriteChannelIds is empty", () => {
    const prev = { tn: NOT_LIVE };
    const next = { tn: LIVE };
    expect(detectLiveTransitions(prev, next, [])).toEqual([]);
  });

  it("returns empty array when no favorites changed state", () => {
    const prev = { tn: NOT_LIVE, c5n: NOT_LIVE };
    const next = { tn: NOT_LIVE, c5n: NOT_LIVE };
    expect(detectLiveTransitions(prev, next, ["tn", "c5n"])).toEqual([]);
  });

  it("returns channel id when a favorite transitions from not-live to live", () => {
    const prev = { tn: NOT_LIVE };
    const next = { tn: LIVE };
    expect(detectLiveTransitions(prev, next, ["tn"])).toEqual(["tn"]);
  });

  it("does not return a channel that was already live in both snapshots", () => {
    const prev = { tn: LIVE };
    const next = { tn: LIVE };
    expect(detectLiveTransitions(prev, next, ["tn"])).toEqual([]);
  });

  it("does not return a channel that went from live to not-live", () => {
    const prev = { tn: LIVE };
    const next = { tn: NOT_LIVE };
    expect(detectLiveTransitions(prev, next, ["tn"])).toEqual([]);
  });

  it("only returns favorites that transitioned, not non-favorites", () => {
    const prev = { tn: NOT_LIVE, c5n: NOT_LIVE };
    const next = { tn: LIVE, c5n: LIVE };
    expect(detectLiveTransitions(prev, next, ["tn"])).toEqual(["tn"]);
  });

  it("returns multiple channels when several favorites go live at once", () => {
    const prev = { tn: NOT_LIVE, c5n: NOT_LIVE, lnmas: NOT_LIVE };
    const next = { tn: LIVE, c5n: LIVE, lnmas: NOT_LIVE };
    const result = detectLiveTransitions(prev, next, ["tn", "c5n", "lnmas"]);
    expect(result).toEqual(["tn", "c5n"]);
  });

  it("treats a channel absent from prev snapshots as not-live", () => {
    const prev: Record<string, LiveChannelSnapshot> = {};
    const next = { tn: LIVE };
    expect(detectLiveTransitions(prev, next, ["tn"])).toEqual(["tn"]);
  });

  it("treats a channel absent from next snapshots as not-live (no transition)", () => {
    const prev = { tn: NOT_LIVE };
    const next: Record<string, LiveChannelSnapshot> = {};
    expect(detectLiveTransitions(prev, next, ["tn"])).toEqual([]);
  });
});
