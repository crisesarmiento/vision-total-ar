"use client";

import { createElement, useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseAdUnitProps = {
  clientId: string;
  slotId: string;
};

export function AdSenseAdUnit({ clientId, slotId }: AdSenseAdUnitProps) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) {
      return;
    }

    pushedRef.current = true;
    window.adsbygoogle = window.adsbygoogle ?? [];
    window.adsbygoogle.push({});
  }, []);

  return createElement("ins", {
    className: "adsbygoogle block min-h-[180px] w-full",
    "data-ad-client": clientId,
    "data-ad-slot": slotId,
    "data-ad-format": "auto",
    "data-full-width-responsive": "true",
  });
}
