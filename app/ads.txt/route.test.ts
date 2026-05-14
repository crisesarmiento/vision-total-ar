import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

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

describe("/ads.txt", () => {
  it("returns 404 without a configured publisher ID", async () => {
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "true";
    delete process.env.ADSENSE_DISABLED;
    vi.stubEnv("NODE_ENV", "production");

    const response = GET();

    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("pub-");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 404 when the kill switch is enabled", async () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1234567890123456";
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "true";
    process.env.ADSENSE_DISABLED = "true";
    vi.stubEnv("NODE_ENV", "production");

    const response = GET();

    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("pub-1234567890123456");
  });

  it("emits a public ads.txt line when production config is enabled", async () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1234567890123456";
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "true";
    delete process.env.ADSENSE_DISABLED;
    vi.stubEnv("NODE_ENV", "production");

    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe(
      "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n",
    );
  });
});
