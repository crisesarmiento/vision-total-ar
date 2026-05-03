import { describe, expect, it } from "vitest";
import { evaluateStreamHealth, STALE_GRACE_MS } from "./stream-health";

const LIVE = { isLive: true };
const NOT_LIVE = { isLive: false };

describe("evaluateStreamHealth", () => {
  it("returns unknown when snapshot is undefined", () => {
    expect(evaluateStreamHealth(undefined, null)).toBe("unknown");
  });

  it("returns healthy when stream is live regardless of timestamp", () => {
    expect(evaluateStreamHealth(LIVE, null)).toBe("healthy");
    expect(evaluateStreamHealth(LIVE, 0)).toBe("healthy");
  });

  it("returns healthy when stream is not live but no timestamp is recorded", () => {
    expect(evaluateStreamHealth(NOT_LIVE, null)).toBe("healthy");
  });

  it("returns healthy when stream is not live within the grace period", () => {
    const firstSeenNotLiveAt = 1000;
    const withinGrace = firstSeenNotLiveAt + STALE_GRACE_MS - 1;
    expect(evaluateStreamHealth(NOT_LIVE, firstSeenNotLiveAt, withinGrace)).toBe("healthy");
  });

  it("returns stale exactly at the grace period boundary", () => {
    const firstSeenNotLiveAt = 1000;
    const atBoundary = firstSeenNotLiveAt + STALE_GRACE_MS;
    expect(evaluateStreamHealth(NOT_LIVE, firstSeenNotLiveAt, atBoundary)).toBe("stale");
  });

  it("returns stale after the grace period has elapsed", () => {
    const firstSeenNotLiveAt = 1000;
    const afterGrace = firstSeenNotLiveAt + STALE_GRACE_MS + 5000;
    expect(evaluateStreamHealth(NOT_LIVE, firstSeenNotLiveAt, afterGrace)).toBe("stale");
  });
});
