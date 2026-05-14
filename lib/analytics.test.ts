import { describe, expect, it } from "vitest";
import {
  beforeSendAnalyticsEvent,
  bucketCount,
  bucketFavoriteCount,
  getDashboardOpenSource,
  getSignupMethodFromAuthContext,
  sanitizeAnalyticsEvent,
  sanitizeAnalyticsUrl,
} from "@/lib/analytics";

describe("analytics privacy helpers", () => {
  it("strips query strings and hashes from analytics URLs", () => {
    expect(sanitizeAnalyticsUrl("https://vision.example/canales?utm_source=x#top")).toBe(
      "https://vision.example/canales",
    );
    expect(sanitizeAnalyticsUrl("/combo/mesa?from=share#grid")).toBe("/combo/mesa");
  });

  it("drops protected account routes before sending page views", () => {
    expect(sanitizeAnalyticsUrl("https://vision.example/perfil?tab=cuenta")).toBeNull();
    expect(sanitizeAnalyticsUrl("/configuracion")).toBeNull();
    expect(sanitizeAnalyticsUrl("/mis-combinaciones/recientes")).toBeNull();
  });

  it("sanitizes Vercel beforeSend events", () => {
    expect(
      beforeSendAnalyticsEvent({
        type: "pageview",
        url: "https://vision.example/canales/tn?utm_source=x",
      }),
    ).toEqual({
      type: "pageview",
      url: "https://vision.example/canales/tn",
    });
    expect(
      beforeSendAnalyticsEvent({
        type: "pageview",
        url: "https://vision.example/mis-combinaciones",
      }),
    ).toBeNull();
  });

  it("allowlists event names and properties", () => {
    expect(
      sanitizeAnalyticsEvent("dashboard_open", {
        source: "public_combo",
        userId: "user-secret",
        comboSlug: "mesa-privada",
      }),
    ).toEqual({
      name: "dashboard_open",
      properties: {
        source: "public_combo",
      },
    });

    expect(
      sanitizeAnalyticsEvent("dashboard_open", {
        source: "private_dashboard",
      }),
    ).toBeNull();
    expect(sanitizeAnalyticsEvent("search_landing_view", { surface: "guides" })).toEqual({
      name: "search_landing_view",
      properties: {
        surface: "guides",
      },
    });
    expect(sanitizeAnalyticsEvent("search_landing_view", { surface: "guide" })).toEqual({
      name: "search_landing_view",
      properties: {
        surface: "guide",
      },
    });
    expect(sanitizeAnalyticsEvent("search_landing_view", { surface: "private" })).toBeNull();
    expect(sanitizeAnalyticsEvent("search_text_entered", { query: "tn" })).toBeNull();
  });

  it("builds coarse count buckets only", () => {
    expect([bucketCount(0), bucketCount(2), bucketCount(4), bucketCount(10)]).toEqual([
      "0",
      "1-2",
      "3-4",
      "5+",
    ]);
    expect(
      [
        bucketFavoriteCount(0),
        bucketFavoriteCount(9),
        bucketFavoriteCount(49),
        bucketFavoriteCount(50),
      ],
    ).toEqual(["0", "1-9", "10-49", "50+"]);
  });

  it("derives dashboard and signup buckets without sensitive identifiers", () => {
    expect(getDashboardOpenSource({ combo: "mesa-de-noticias" })).toBe("public_combo");
    expect(getDashboardOpenSource({ layout: "encoded-layout" })).toBe("shared_layout");
    expect(getDashboardOpenSource({})).toBe("direct");

    expect(getSignupMethodFromAuthContext({ path: "/sign-up/email" })).toBe("email");
    expect(getSignupMethodFromAuthContext({ path: "/callback/google" })).toBe("google");
    expect(getSignupMethodFromAuthContext({ path: "/magic-link/verify" })).toBe(
      "magic_link",
    );
    expect(getSignupMethodFromAuthContext({ path: "/unknown" })).toBe("unknown");
  });
});
