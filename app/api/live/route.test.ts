import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearRateLimitBuckets } from "@/lib/rate-limit";
import { getLiveSnapshots } from "@/lib/youtube";
import { GET } from "./route";

vi.mock("@/lib/youtube", () => ({
  getLiveSnapshots: vi.fn(async () => ({
    tn: {
      channelId: "UC-test",
      isLive: true,
      viewerCount: 100,
      title: "Live",
      thumbnailUrl: null,
      startedAt: null,
    },
  })),
}));

describe("/api/live rate limiting", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
    vi.mocked(getLiveSnapshots).mockClear();
  });

  it("returns live snapshots below the burst limit", async () => {
    const response = await GET(new Request("http://localhost/api/live"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toHaveProperty("tn.isLive", true);
  });

  it("returns 429 after the burst limit", async () => {
    const request = () =>
      new Request("http://localhost/api/live", {
        headers: { "x-forwarded-for": "203.0.113.20" },
      });

    for (let index = 0; index < 30; index += 1) {
      expect((await GET(request())).status).toBe(200);
    }

    const response = await GET(request());

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      error: "rate_limited",
    });
  });

  it("includes rate-limit headers on 429", async () => {
    const request = () =>
      new Request("http://localhost/api/live", {
        headers: { "x-forwarded-for": "203.0.113.22" },
      });

    for (let index = 0; index < 30; index += 1) {
      await GET(request());
    }

    const response = await GET(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(response.headers.get("X-RateLimit-Limit")).toBe("30");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });
});
