import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnabled = process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS;

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  if (originalEnabled === undefined) {
    delete process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS;
  } else {
    process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS = originalEnabled;
  }
});

describe("trackClientAnalyticsEvent", () => {
  it("is a no-op when analytics is disabled", async () => {
    process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS = "false";
    const track = vi.fn();
    vi.doMock("@vercel/analytics", () => ({ track }));

    const { trackClientAnalyticsEvent } = await import("@/lib/analytics-client");

    trackClientAnalyticsEvent("dashboard_open", { source: "direct" });

    expect(track).not.toHaveBeenCalled();
  });

  it("tracks only sanitized allowlisted properties when enabled", async () => {
    process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS = "true";
    const track = vi.fn();
    vi.doMock("@vercel/analytics", () => ({ track }));

    const { trackClientAnalyticsEvent } = await import("@/lib/analytics-client");

    trackClientAnalyticsEvent("dashboard_open", {
      source: "public_combo",
      userId: "not-forwarded",
    } as never);

    expect(track).toHaveBeenCalledWith("dashboard_open", {
      source: "public_combo",
    });
  });

  it("does not track invalid event payloads", async () => {
    process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS = "true";
    const track = vi.fn();
    vi.doMock("@vercel/analytics", () => ({ track }));

    const { trackClientAnalyticsEvent } = await import("@/lib/analytics-client");

    trackClientAnalyticsEvent("dashboard_open", {
      source: "account_dashboard",
    } as never);

    expect(track).not.toHaveBeenCalled();
  });
});
