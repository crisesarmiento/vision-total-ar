import { getAdSenseConfig } from "@/lib/adsense";

export function GET() {
  const config = getAdSenseConfig();

  if (!config.enabled || !config.adsTxtPublisherId) {
    return new Response(null, {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response(
    `google.com, ${config.adsTxtPublisherId}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
