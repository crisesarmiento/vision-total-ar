import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearRateLimitBuckets } from "@/lib/rate-limit";
import { GET, POST } from "./route";

vi.mock("@/lib/auth", () => ({
  auth: {},
}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: () => ({
    GET: vi.fn(async () => Response.json({ ok: true })),
    POST: vi.fn(async (request: Request) => {
      const body = await request.json();
      return Response.json({ ok: true, body });
    }),
  }),
}));

describe("/api/auth rate limiting", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("does not consume the auth POST body while inspecting email", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.40",
        },
        body: JSON.stringify({ email: "User@Example.com", password: "secret" }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      body: {
        email: "User@Example.com",
        password: "secret",
      },
    });
  });

  it("rate limits magic-link attempts by normalized email", async () => {
    const request = (email: string) =>
      new Request("http://localhost/api/auth/sign-in/magic-link", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.50",
        },
        body: JSON.stringify({ email }),
      });

    for (let index = 0; index < 5; index += 1) {
      expect((await POST(request("User@Example.com"))).status).toBe(200);
    }

    const response = await POST(request("user@example.com"));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      error: "rate_limited",
    });
  });

  it("returns 429 after GET burst limit with rate-limit headers", async () => {
    const request = () =>
      new Request("http://localhost/api/auth/session", {
        headers: { "x-forwarded-for": "203.0.113.41" },
      });

    for (let index = 0; index < 120; index += 1) {
      await GET(request());
    }

    const response = await GET(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(response.headers.get("X-RateLimit-Limit")).toBe("120");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });

  it("includes rate-limit headers on magic-link POST 429", async () => {
    const request = (email: string) =>
      new Request("http://localhost/api/auth/sign-in/magic-link", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.51",
        },
        body: JSON.stringify({ email }),
      });

    for (let index = 0; index < 5; index += 1) {
      await POST(request("headers-test@example.com"));
    }

    const response = await POST(request("headers-test@example.com"));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });
});
