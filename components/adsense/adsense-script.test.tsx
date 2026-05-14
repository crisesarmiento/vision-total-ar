import { afterEach, describe, expect, it, vi } from "vitest";
import { AdSenseScript } from "./adsense-script";

const originalClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const originalEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED;
const originalDisabled = process.env.ADSENSE_DISABLED;

afterEach(() => {
  vi.unstubAllEnvs();

  if (originalClientId === undefined) {
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  } else {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = originalClientId;
  }

  if (originalEnabled === undefined) {
    delete process.env.NEXT_PUBLIC_ADSENSE_ENABLED;
  } else {
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = originalEnabled;
  }

  if (originalDisabled === undefined) {
    delete process.env.ADSENSE_DISABLED;
  } else {
    process.env.ADSENSE_DISABLED = originalDisabled;
  }
});

describe("AdSenseScript", () => {
  it("renders nothing when disabled", () => {
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    delete process.env.NEXT_PUBLIC_ADSENSE_ENABLED;
    delete process.env.ADSENSE_DISABLED;
    vi.stubEnv("NODE_ENV", "production");

    expect(AdSenseScript()).toBeNull();
  });

  it("renders the AdSense loader when explicitly enabled for production", () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1234567890123456";
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "true";
    delete process.env.ADSENSE_DISABLED;
    vi.stubEnv("NODE_ENV", "production");

    const element = AdSenseScript();

    expect(element).not.toBeNull();
    expect(element?.props.id).toBe("adsense-script");
    expect(element?.props.src).toBe(
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456",
    );
    expect(element?.props.crossOrigin).toBe("anonymous");
  });
});
