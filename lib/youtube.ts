import { unstable_cache } from "next/cache";
import { channels } from "@/lib/channels";

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

async function fetchLiveVideoId(channelId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `${LIVE_CHANNELS_ENDPOINT}&channelId=${channelId}&key=${apiKey}`,
    {
      next: { revalidate: 60 },
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

async function fetchVideoDetails(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${VIDEOS_ENDPOINT}&id=${videoId}&key=${apiKey}`, {
    next: { revalidate: 60 },
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

export const getLiveSnapshots = unstable_cache(
  async (): Promise<Record<string, LiveChannelSnapshot>> => {
    const entries = await Promise.all(
      channels.map(async (channel) => {
        const liveVideoId = await fetchLiveVideoId(channel.channelId);

        if (!liveVideoId) {
          return [
            channel.id,
            {
              channelId: channel.channelId,
              isLive: false,
              viewerCount: null,
              title: null,
              thumbnailUrl: null,
              startedAt: null,
            } satisfies LiveChannelSnapshot,
          ] as const;
        }

        const details = await fetchVideoDetails(liveVideoId);

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
  },
  ["vision-ar-live-snapshots"],
  {
    revalidate: 60,
    tags: ["live-snapshots"],
  },
);
