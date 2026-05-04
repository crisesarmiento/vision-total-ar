import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { securityHeaders } from "@/lib/security-headers";

const withPWA = withPWAInit({
  dest: "public",
  // Disable in development (hot reload incompatibility) and in CI (service worker
  // error events surface as ErrorEvent objects that cause homepage 500s in tests).
  disable: process.env.NODE_ENV === "development" || !!process.env.CI,
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default withPWA(nextConfig);
