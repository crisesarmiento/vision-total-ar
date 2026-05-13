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

describe("trackServerAnalyticsEvent", () => {
  it("is a no-op when analytics is disabled", async () => {
    process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS = "false";
    const track = vi.fn();
    vi.doMock("@vercel/analytics/server", () => ({ track }));

    const { trackServerAnalyticsEvent } = await import("@/lib/analytics-server");

    await trackServerAnalyticsEvent("signup_completed", { method: "email" });

    expect(track).not.toHaveBeenCalled();
  });

  it("tracks sanitized server events when enabled", async () => {
    process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS = "true";
    const track = vi.fn();
    vi.doMock("@vercel/analytics/server", () => ({ track }));

    const { trackServerAnalyticsEvent } = await import("@/lib/analytics-server");

    await trackServerAnalyticsEvent("signup_completed", {
      method: "google",
      email: "not-forwarded@example.com",
    } as never);

    expect(track).toHaveBeenCalledWith("signup_completed", {
      method: "google",
    });
  });

  it("does not throw when the analytics provider rejects", async () => {
    process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS = "true";
    const track = vi.fn().mockRejectedValue(new Error("provider unavailable"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.doMock("@vercel/analytics/server", () => ({ track }));

    const { trackServerAnalyticsEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerAnalyticsEvent("signup_completed", { method: "email" }),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith("[analytics] failed to send server event", {
      event: "signup_completed",
      error: "provider unavailable",
    });

    warn.mockRestore();
  });
});
