import { describe, expect, it } from "vitest";
import {
  createAdSensePlacementConfig,
  createAdSenseConfig,
  getAdsTxtPublisherId,
  isValidAdSenseClientId,
  isValidAdSenseSlotId,
} from "./adsense";

describe("AdSense config", () => {
  const validClientId = "ca-pub-1234567890123456";

  it("is disabled when env is unset", () => {
    expect(createAdSenseConfig({}, "production")).toEqual({
      enabled: false,
      clientId: null,
      adsTxtPublisherId: null,
    });
  });

  it("is disabled outside production", () => {
    expect(
      createAdSenseConfig(
        {
          NEXT_PUBLIC_ADSENSE_CLIENT_ID: validClientId,
          NEXT_PUBLIC_ADSENSE_ENABLED: "true",
        },
        "development",
      ),
    ).toEqual({
      enabled: false,
      clientId: null,
      adsTxtPublisherId: null,
    });
  });

  it("is disabled by the server-side kill switch", () => {
    expect(
      createAdSenseConfig(
        {
          NEXT_PUBLIC_ADSENSE_CLIENT_ID: validClientId,
          NEXT_PUBLIC_ADSENSE_ENABLED: "true",
          ADSENSE_DISABLED: "true",
        },
        "production",
      ),
    ).toEqual({
      enabled: false,
      clientId: null,
      adsTxtPublisherId: null,
    });
  });

  it("is enabled only with production, explicit enable, and a valid client ID", () => {
    expect(
      createAdSenseConfig(
        {
          NEXT_PUBLIC_ADSENSE_CLIENT_ID: validClientId,
          NEXT_PUBLIC_ADSENSE_ENABLED: "true",
        },
        "production",
      ),
    ).toEqual({
      enabled: true,
      clientId: validClientId,
      adsTxtPublisherId: "pub-1234567890123456",
    });
  });

  it("rejects invalid client IDs", () => {
    expect(isValidAdSenseClientId("pub-1234567890123456")).toBe(false);
    expect(isValidAdSenseClientId("ca-pub-demo")).toBe(false);
    expect(
      createAdSenseConfig(
        {
          NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-demo",
          NEXT_PUBLIC_ADSENSE_ENABLED: "true",
        },
        "production",
      ),
    ).toEqual({
      enabled: false,
      clientId: null,
      adsTxtPublisherId: null,
    });
  });

  it("converts ca-pub client IDs into ads.txt publisher IDs", () => {
    expect(getAdsTxtPublisherId(validClientId)).toBe("pub-1234567890123456");
  });

  it("validates numeric ad slot IDs", () => {
    expect(isValidAdSenseSlotId("1234567890")).toBe(true);
    expect(isValidAdSenseSlotId("")).toBe(false);
    expect(isValidAdSenseSlotId("slot-demo")).toBe(false);
    expect(isValidAdSenseSlotId("123 456")).toBe(false);
  });

  it("returns disabled placement config when global AdSense config is disabled", () => {
    expect(
      createAdSensePlacementConfig(
        "channels-index",
        {
          NEXT_PUBLIC_ADSENSE_CLIENT_ID: validClientId,
          NEXT_PUBLIC_ADSENSE_ENABLED: "false",
          NEXT_PUBLIC_ADSENSE_SLOT_CHANNELS_INDEX: "1234567890",
        },
        "production",
      ),
    ).toEqual({
      enabled: false,
      clientId: null,
      slotId: null,
      surface: "channels-index",
    });
  });

  it("ignores blank or invalid slot IDs", () => {
    expect(
      createAdSensePlacementConfig(
        "channel-category",
        {
          NEXT_PUBLIC_ADSENSE_CLIENT_ID: validClientId,
          NEXT_PUBLIC_ADSENSE_ENABLED: "true",
          NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_CATEGORY: " ",
        },
        "production",
      ).enabled,
    ).toBe(false);

    expect(
      createAdSensePlacementConfig(
        "channel-detail",
        {
          NEXT_PUBLIC_ADSENSE_CLIENT_ID: validClientId,
          NEXT_PUBLIC_ADSENSE_ENABLED: "true",
          NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_DETAIL: "slot-demo",
        },
        "production",
      ).enabled,
    ).toBe(false);
  });

  it("enables only the requested surface with a numeric slot ID", () => {
    const env = {
      NEXT_PUBLIC_ADSENSE_CLIENT_ID: validClientId,
      NEXT_PUBLIC_ADSENSE_ENABLED: "true",
      NEXT_PUBLIC_ADSENSE_SLOT_CHANNELS_INDEX: "1234567890",
      NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_CATEGORY: "9876543210",
    };

    expect(createAdSensePlacementConfig("channels-index", env, "production")).toEqual({
      enabled: true,
      clientId: validClientId,
      slotId: "1234567890",
      surface: "channels-index",
    });
    expect(createAdSensePlacementConfig("public-combo", env, "production")).toEqual({
      enabled: false,
      clientId: null,
      slotId: null,
      surface: "public-combo",
    });
  });
});
