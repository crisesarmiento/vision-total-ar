import { createElement } from "react";
import Script from "next/script";
import { getAdSenseConfig } from "@/lib/adsense";

export function AdSenseScript() {
  const config = getAdSenseConfig();

  if (!config.enabled || !config.clientId) {
    return null;
  }

  const params = new URLSearchParams({
    client: config.clientId,
  });

  return createElement(Script, {
    id: "adsense-script",
    async: true,
    strategy: "afterInteractive",
    crossOrigin: "anonymous",
    src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?${params.toString()}`,
  });
}
