"use client";

import { track } from "@vercel/analytics";
import {
  ENABLE_WEB_ANALYTICS,
  sanitizeAnalyticsEvent,
  type AnalyticsEventInput,
  type AnalyticsEventName,
  type AnalyticsEventPayloadMap,
} from "@/lib/analytics";

export function trackClientAnalyticsEvent<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEventPayloadMap[Name],
) {
  if (!ENABLE_WEB_ANALYTICS) {
    return;
  }

  const event = sanitizeAnalyticsEvent(name, properties);

  if (!event) {
    return;
  }

  track(event.name, event.properties);
}

export function trackClientAnalyticsEvents(events: AnalyticsEventInput[]) {
  for (const event of events) {
    if (!ENABLE_WEB_ANALYTICS) {
      return;
    }

    const sanitized = sanitizeAnalyticsEvent(event.name, event.properties);

    if (!sanitized) {
      continue;
    }

    track(sanitized.name, sanitized.properties);
  }
}
