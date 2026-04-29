import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearRateLimitBuckets } from "@/lib/rate-limit";
import { getTickerItems } from "@/lib/rss";
import { GET } from "./route";

vi.mock("@/lib/rss", () => ({
  getTickerItems: vi.fn(async () => [
    {
      id: "tn-1",
      title: "Titular",
      link: "https://example.com",
      source: "TN",
      publishedAt: new Date(0).toISOString(),
    },
  ]),
}));

describe("/api/ticker rate limiting", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
    vi.mocked(getTickerItems).mockClear();
  });

  it("returns ticker items below the burst limit", async () => {
    const response = await GET(new Request("http://localhost/api/ticker"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toHaveLength(1);
  });

  it("returns 429 after the burst limit", async () => {
    const request = () =>
      new Request("http://localhost/api/ticker", {
        headers: { "x-forwarded-for": "203.0.113.30" },
      });

    for (let index = 0; index < 20; index += 1) {
      expect((await GET(request())).status).toBe(200);
    }

    const response = await GET(request());

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      error: "rate_limited",
    });
  });
});
