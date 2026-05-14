"use client";

import { Analytics } from "@vercel/analytics/next";
import { beforeSendAnalyticsEvent, ENABLE_WEB_ANALYTICS } from "@/lib/analytics";

export function WebAnalytics() {
  if (!ENABLE_WEB_ANALYTICS) {
    return null;
  }

  return <Analytics beforeSend={beforeSendAnalyticsEvent} />;
}
