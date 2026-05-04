"use client";

import { useEffect, useRef } from "react";
import { detectLiveTransitions } from "@/lib/live-alerts";
import { getChannelById } from "@/lib/channels";
import type { LiveChannelSnapshot } from "@/lib/youtube";

type UseLiveAlertsOptions = {
  liveSnapshots: Record<string, LiveChannelSnapshot>;
  favoriteChannelIds: string[];
  enabled: boolean;
};

/**
 * Fires a browser notification whenever a favorited channel transitions from
 * not-live to live. Each unique live session (identified by startedAt) triggers
 * at most one notification — if a channel drops off and comes back it notifies again.
 *
 * Requires `enabled` to be true and browser notification permission to be granted.
 * Degrades silently when the Notification API is unavailable or permission is denied.
 */
export function useLiveAlerts({
  liveSnapshots,
  favoriteChannelIds,
  enabled,
}: UseLiveAlertsOptions) {
  const prevSnapshotsRef = useRef<Record<string, LiveChannelSnapshot>>(liveSnapshots);

  // Maps channelId → startedAt value of the session already notified about.
  // Cleared when a channel goes offline so the next live session re-triggers.
  const notifiedSessionsRef = useRef<Map<string, string | null>>(new Map());

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, [enabled]);

  useEffect(() => {
    const prev = prevSnapshotsRef.current;
    prevSnapshotsRef.current = liveSnapshots;

    if (!enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const transitioned = detectLiveTransitions(prev, liveSnapshots, favoriteChannelIds);

    for (const channelId of transitioned) {
      const snapshot = liveSnapshots[channelId];
      if (!snapshot) continue;

      const sessionKey = snapshot.startedAt ?? null;
      const lastNotifiedKey = notifiedSessionsRef.current.get(channelId);

      if (lastNotifiedKey !== undefined && lastNotifiedKey === sessionKey) {
        continue;
      }

      notifiedSessionsRef.current.set(channelId, sessionKey);

      const channel = getChannelById(channelId);
      const title = channel ? `¡${channel.name} está en vivo!` : "¡Señal en vivo!";
      const body = snapshot.title ?? channel?.description ?? undefined;

      try {
        new Notification(title, {
          body,
          icon: "/icon.png",
          tag: `live-alert-${channelId}`,
        });
      } catch {
        // Notification constructor can throw in some environments; degrade silently.
      }
    }

    // Clear notified sessions for channels that went offline so the next live
    // session will trigger a new notification.
    for (const channelId of favoriteChannelIds) {
      if (!liveSnapshots[channelId]?.isLive) {
        notifiedSessionsRef.current.delete(channelId);
      }
    }
  }, [liveSnapshots, favoriteChannelIds, enabled]);
}
