export type StreamHealthStatus = "healthy" | "stale" | "unknown";

export const STALE_GRACE_MS = 90_000;

export function evaluateStreamHealth(
  snapshot: { isLive: boolean } | undefined,
  firstSeenNotLiveAt: number | null,
  now = Date.now(),
): StreamHealthStatus {
  if (!snapshot) return "unknown";
  if (snapshot.isLive) return "healthy";
  if (firstSeenNotLiveAt === null) return "healthy";
  return now - firstSeenNotLiveAt >= STALE_GRACE_MS ? "stale" : "healthy";
}
