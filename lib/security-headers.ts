export type SecurityHeader = { key: string; value: string };

// script-src uses 'unsafe-inline' because Next.js App Router RSC hydration injects
// inline scripts. A nonce-based policy is a future improvement (tracked as follow-up).
// frame-src allows youtube.com and youtube-nocookie.com for live embed tiles.
// connect-src lists UploadThing CDN explicitly; YouTube API calls are server-side only.
// frame-ancestors 'self' prevents clickjacking; X-Frame-Options provides legacy fallback.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://utfs.io https://uploadthing.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "connect-src 'self' https://uploadthing.com https://utfs.io https://api.uploadthing.com",
  "media-src 'self'",
  "font-src 'self' data:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

export const securityHeaders: SecurityHeader[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // X-Frame-Options is a legacy fallback; frame-ancestors in CSP takes precedence in
  // modern browsers.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];
