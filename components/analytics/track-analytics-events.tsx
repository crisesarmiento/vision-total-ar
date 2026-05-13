"use client";

import { useEffect } from "react";
import { trackClientAnalyticsEvents } from "@/lib/analytics-client";
import type { AnalyticsEventInput } from "@/lib/analytics";

type TrackAnalyticsEventsProps = {
  events: AnalyticsEventInput[];
};

export function TrackAnalyticsEvents({ events }: TrackAnalyticsEventsProps) {
  useEffect(() => {
    trackClientAnalyticsEvents(events);
  }, [events]);

  return null;
}
