import { unstable_cache } from "next/cache";
import { channels } from "@/lib/channels";
import type { NewsChannel } from "@/lib/channels";

export type LiveChannelSnapshot = {
  channelId: string;
  isLive: boolean;
  viewerCount: number | null;
  title: string | null;
  thumbnailUrl: string | null;
  startedAt: string | null;
};

const LIVE_CHANNELS_ENDPOINT =
  "https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&maxResults=1";
const VIDEOS_ENDPOINT =
  "https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails";

async function fetchLiveVideoId(channelId: string, revalidate: number) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `${LIVE_CHANNELS_ENDPOINT}&channelId=${channelId}&key=${apiKey}`,
    {
      next: { revalidate },
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    items?: Array<{
      id?: {
        videoId?: string;
      };
    }>;
  };

  return payload.items?.[0]?.id?.videoId ?? null;
}

async function fetchVideoDetails(videoId: string, revalidate: number) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${VIDEOS_ENDPOINT}&id=${videoId}&key=${apiKey}`, {
    next: { revalidate },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    items?: Array<{
      snippet?: {
        title?: string;
        thumbnails?: {
          high?: {
            url?: string;
          };
        };
      };
      liveStreamingDetails?: {
        concurrentViewers?: string;
        actualStartTime?: string;
      };
    }>;
  };

  return payload.items?.[0] ?? null;
}

function notLiveSnapshot(channel: NewsChannel): LiveChannelSnapshot {
  return {
    channelId: channel.channelId,
    isLive: false,
    viewerCount: null,
    title: null,
    thumbnailUrl: null,
    startedAt: null,
  };
}

/**
 * Fetches live snapshots for a set of channels, passing the tier's revalidation
 * interval to the underlying fetch calls so both the Next.js data cache and the
 * unstable_cache TTL match the intended refresh window.
 *
 * Quota cost per channel per cycle: ~100 units (search.list) + 1 unit
 * (videos.list, only when the channel is live).
 */
async function fetchSnapshotsForChannels(
  tierChannels: NewsChannel[],
  revalidate: number,
): Promise<Record<string, LiveChannelSnapshot>> {
  const entries = await Promise.all(
    tierChannels.map(async (channel) => {
      const liveVideoId = await fetchLiveVideoId(channel.channelId, revalidate);

      if (!liveVideoId) {
        return [channel.id, notLiveSnapshot(channel)] as const;
      }

      const details = await fetchVideoDetails(liveVideoId, revalidate);

      return [
        channel.id,
        {
          channelId: channel.channelId,
          isLive: true,
          viewerCount: Number(
            details?.liveStreamingDetails?.concurrentViewers ?? "0",
          ),
          title: details?.snippet?.title ?? null,
          thumbnailUrl: details?.snippet?.thumbnails?.high?.url ?? null,
          startedAt: details?.liveStreamingDetails?.actualStartTime ?? null,
        } satisfies LiveChannelSnapshot,
      ] as const;
    }),
  );

  return Object.fromEntries(entries);
}

const tier1Channels = channels.filter((ch) => ch.refreshTier === 1);
const tier2Channels = channels.filter((ch) => ch.refreshTier === 2);
const tier3Channels = channels.filter((ch) => ch.refreshTier === 3);

/**
 * Tier 1 — 60 s revalidation.
 * Top editorial channels (tn, c5n, lnmas, a24). Highest refresh priority.
 * Estimated quota per refresh cycle: ~4 × 100 = 400 units (search only).
 */
const getLiveTier1Snapshots = unstable_cache(
  () => fetchSnapshotsForChannels(tier1Channels, 60),
  ["live-snapshots-tier-1"],
  {
    revalidate: 60,
    tags: ["live-snapshots", "live-snapshots-tier-1"],
  },
);

/**
 * Tier 2 — 120 s revalidation.
 * Secondary news and broad-reach TV channels.
 * Estimated quota per refresh cycle: ~5 × 100 = 500 units (search only).
 */
const getLiveTier2Snapshots = unstable_cache(
  () => fetchSnapshotsForChannels(tier2Channels, 120),
  ["live-snapshots-tier-2"],
  {
    revalidate: 120,
    tags: ["live-snapshots", "live-snapshots-tier-2"],
  },
);

/**
 * Tier 3 — 300 s revalidation.
 * Streaming, independent, and lower-traffic channels.
 * Estimated quota per refresh cycle: ~7 × 100 = 700 units (search only).
 * At 300 s intervals these channels consume ~5× fewer units per day than
 * Tier 1 channels at 60 s intervals.
 */
const getLiveTier3Snapshots = unstable_cache(
  () => fetchSnapshotsForChannels(tier3Channels, 300),
  ["live-snapshots-tier-3"],
  {
    revalidate: 300,
    tags: ["live-snapshots", "live-snapshots-tier-3"],
  },
);

/**
 * Returns a merged live snapshot record for all channels across all tiers.
 *
 * Public API — backward compatible with previous single-tier implementation.
 * Callers receive the same `Record<string, LiveChannelSnapshot>` shape
 * regardless of which tier each channel belongs to.
 *
 * Tier results are fetched in parallel; tier 1 entries win on key collision
 * (though channel ids are unique across tiers, so collisions should not occur).
 */
export async function getLiveSnapshots(): Promise<Record<string, LiveChannelSnapshot>> {
  const [t1, t2, t3] = await Promise.all([
    getLiveTier1Snapshots(),
    getLiveTier2Snapshots(),
    getLiveTier3Snapshots(),
  ]);
  return { ...t3, ...t2, ...t1 };
}
