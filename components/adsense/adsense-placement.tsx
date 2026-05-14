import { createElement } from "react";
import { AdSenseAdUnit } from "@/components/adsense/adsense-ad-unit";
import {
  getAdSensePlacementConfig,
  type AdSensePlacementSurface,
} from "@/lib/adsense";
import { cn } from "@/lib/utils";

type AdSensePlacementProps = {
  surface: AdSensePlacementSurface;
  className?: string;
};

export function AdSensePlacement({ surface, className }: AdSensePlacementProps) {
  const config = getAdSensePlacementConfig(surface);

  if (!config.enabled || !config.clientId || !config.slotId) {
    return null;
  }

  return createElement(
    "section",
    {
      "aria-label": "Publicidad",
      className: cn(
        "my-10 rounded-lg border border-white/10 bg-black/20 px-4 py-3",
        className,
      ),
    },
    createElement(
      "p",
      {
        className: "mb-2 text-center text-xs uppercase tracking-[0.24em] text-white/45",
      },
      "Publicidad",
    ),
    createElement(
      "div",
      {
        className: "min-h-[180px] overflow-hidden",
      },
      createElement(AdSenseAdUnit, {
        clientId: config.clientId,
        slotId: config.slotId,
      }),
    ),
  );
}
