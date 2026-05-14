import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdSensePlacement } from "./adsense-placement";

const ENV_KEYS = [
  "NEXT_PUBLIC_ADSENSE_CLIENT_ID",
  "NEXT_PUBLIC_ADSENSE_ENABLED",
  "NEXT_PUBLIC_ADSENSE_SLOT_CHANNELS_INDEX",
  "NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_CATEGORY",
  "NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_DETAIL",
  "NEXT_PUBLIC_ADSENSE_SLOT_PUBLIC_COMBO",
  "ADSENSE_DISABLED",
] as const;

const originalEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>;

afterEach(() => {
  vi.unstubAllEnvs();

  for (const key of ENV_KEYS) {
    const value = originalEnv[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("AdSensePlacement", () => {
  it("renders nothing when the placement is disabled", () => {
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "true";
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHANNELS_INDEX = "1234567890";
    delete process.env.ADSENSE_DISABLED;
    vi.stubEnv("NODE_ENV", "production");

    expect(AdSensePlacement({ surface: "channels-index" })).toBeNull();
  });

  it("renders an enabled display ad unit with the expected metadata", () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1234567890123456";
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "true";
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHANNELS_INDEX = "1234567890";
    delete process.env.ADSENSE_DISABLED;
    vi.stubEnv("NODE_ENV", "production");

    const element = AdSensePlacement({ surface: "channels-index" });
    const placement = element as unknown as ReactElement<{
      "aria-label": string;
      children: [
        ReactElement,
        ReactElement<{
          children: ReactElement<{
            clientId: string;
            slotId: string;
          }>;
        }>,
      ];
    }>;

    expect(element).not.toBeNull();
    expect(placement.props["aria-label"]).toBe("Publicidad");

    const wrapper = placement.props.children[1];
    const adUnit = wrapper.props.children;

    expect(adUnit.props.clientId).toBe("ca-pub-1234567890123456");
    expect(adUnit.props.slotId).toBe("1234567890");
  });
});
