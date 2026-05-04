import type { LiveChannelSnapshot } from "@/lib/youtube";

/**
 * Returns the IDs of favorite channels that transitioned from not-live to live
 * between two consecutive snapshot maps.
 *
 * Pure function — safe to call in tests without a DOM or React context.
 */
export function detectLiveTransitions(
  prev: Record<string, LiveChannelSnapshot>,
  next: Record<string, LiveChannelSnapshot>,
  favoriteChannelIds: string[],
): string[] {
  return favoriteChannelIds.filter(
    (id) => !prev[id]?.isLive && next[id]?.isLive === true,
  );
}
