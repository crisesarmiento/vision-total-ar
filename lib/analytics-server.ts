import { track } from "@vercel/analytics/server";
import {
  ENABLE_WEB_ANALYTICS,
  sanitizeAnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsEventPayloadMap,
} from "@/lib/analytics";

export async function trackServerAnalyticsEvent<Name extends AnalyticsEventName>(
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

  try {
    await track(event.name, event.properties);
  } catch (error) {
    console.warn("[analytics] failed to send server event", {
      event: event.name,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
}
