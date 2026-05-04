import { describe, expect, it } from "vitest";
import { securityHeaders } from "./security-headers";

function header(key: string) {
  return securityHeaders.find((h) => h.key === key);
}

describe("securityHeaders", () => {
  describe("Content-Security-Policy", () => {
    it("is present", () => {
      expect(header("Content-Security-Policy")).toBeDefined();
    });

    it("sets default-src to self", () => {
      expect(header("Content-Security-Policy")?.value).toContain("default-src 'self'");
    });

    it("allows YouTube frame embeds", () => {
      const value = header("Content-Security-Policy")?.value ?? "";
      expect(value).toContain("https://www.youtube.com");
      expect(value).toContain("https://www.youtube-nocookie.com");
      expect(value).toContain("frame-src");
    });

    it("blocks object embeds", () => {
      expect(header("Content-Security-Policy")?.value).toContain("object-src 'none'");
    });

    it("prevents clickjacking with frame-ancestors self", () => {
      expect(header("Content-Security-Policy")?.value).toContain("frame-ancestors 'self'");
    });

    it("enforces HTTPS upgrade", () => {
      expect(header("Content-Security-Policy")?.value).toContain(
        "upgrade-insecure-requests",
      );
    });

    it("restricts form actions to self", () => {
      expect(header("Content-Security-Policy")?.value).toContain("form-action 'self'");
    });
  });

  describe("X-Frame-Options", () => {
    it("is set to SAMEORIGIN", () => {
      expect(header("X-Frame-Options")?.value).toBe("SAMEORIGIN");
    });
  });

  describe("X-Content-Type-Options", () => {
    it("is set to nosniff", () => {
      expect(header("X-Content-Type-Options")?.value).toBe("nosniff");
    });
  });

  describe("Strict-Transport-Security", () => {
    it("is present with a max-age", () => {
      const value = header("Strict-Transport-Security")?.value ?? "";
      expect(value).toMatch(/max-age=\d+/);
    });

    it("includes includeSubDomains", () => {
      expect(header("Strict-Transport-Security")?.value).toContain("includeSubDomains");
    });
  });

  describe("Permissions-Policy", () => {
    it("disables camera", () => {
      expect(header("Permissions-Policy")?.value).toContain("camera=()");
    });

    it("disables microphone", () => {
      expect(header("Permissions-Policy")?.value).toContain("microphone=()");
    });

    it("disables geolocation", () => {
      expect(header("Permissions-Policy")?.value).toContain("geolocation=()");
    });
  });

  describe("Referrer-Policy", () => {
    it("is strict-origin-when-cross-origin", () => {
      expect(header("Referrer-Policy")?.value).toBe("strict-origin-when-cross-origin");
    });
  });
});
