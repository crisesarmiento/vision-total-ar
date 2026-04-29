import { describe, expect, it, beforeEach } from "vitest";
import {
  checkRateLimit,
  checkRequestRateLimit,
  clearRateLimitBuckets,
  normalizeRateLimitKey,
} from "@/lib/rate-limit";

const policy = {
  id: "test-policy",
  limit: 2,
  windowMs: 1_000,
};

describe("rate limit helper", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("allows requests below the configured limit", () => {
    expect(checkRateLimit(policy, "client-a", 0).allowed).toBe(true);
    expect(checkRateLimit(policy, "client-a", 100).allowed).toBe(true);
  });

  it("blocks requests after the configured limit", () => {
    checkRateLimit(policy, "client-a", 0);
    checkRateLimit(policy, "client-a", 100);

    const result = checkRateLimit(policy, "client-a", 200);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBe(1);
  });

  it("resets after the fixed window expires", () => {
    checkRateLimit(policy, "client-a", 0);
    checkRateLimit(policy, "client-a", 100);
    expect(checkRateLimit(policy, "client-a", 200).allowed).toBe(false);

    expect(checkRateLimit(policy, "client-a", 1_001).allowed).toBe(true);
  });

  it("separates buckets by policy and key", () => {
    checkRateLimit(policy, "client-a", 0);
    checkRateLimit(policy, "client-a", 100);

    expect(checkRateLimit(policy, "client-b", 200).allowed).toBe(true);
    expect(
      checkRateLimit({ ...policy, id: "second-policy" }, "client-a", 200).allowed,
    ).toBe(true);
  });

  it("normalizes email-style keys case-insensitively", () => {
    expect(normalizeRateLimitKey(" User@Example.COM ")).toBe("user@example.com");

    checkRateLimit(policy, " User@Example.COM ", 0);
    checkRateLimit(policy, "user@example.com", 100);

    expect(checkRateLimit(policy, "USER@example.com", 200).allowed).toBe(false);
  });

  it("uses forwarded client headers for request keys", () => {
    const request = new Request("http://localhost/api/live", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 198.51.100.5",
      },
    });

    const first = checkRequestRateLimit(request, policy);
    const second = checkRateLimit(policy, "203.0.113.10");

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });
});
