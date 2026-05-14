import { describe, expect, it } from "vitest";
import {
  createAdSenseConfig,
  getAdsTxtPublisherId,
  isValidAdSenseClientId,
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
});
