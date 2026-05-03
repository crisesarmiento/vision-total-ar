import { LiveDashboard } from "@/components/dashboard/live-dashboard";
import {
  decodeDashboardLayoutShareParam,
  parseDashboardLayout,
} from "@/lib/dashboard-layout";
import { fromStoredGridPreset, type StoredGridPreset } from "@/lib/layout-presets";
import { prisma } from "@/lib/prisma";
import { getTickerItems } from "@/lib/rss";
import { getSession } from "@/lib/session";
import { getLiveSnapshots } from "@/lib/youtube";
import { channels } from "@/lib/channels";
import {
  rankLiveChannels,
  rankRelevantCombos,
  type RankedChannel,
  type RankedCombo,
} from "@/lib/home/live-now";

export const dynamic = "force-dynamic";

type FeaturedCombination = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  favoritesCount: number;
};

type LiveNowComboCandidate = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  favoritesCount: number;
  layoutJson: unknown;
  updatedAt: Date;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ combo?: string; layout?: string }>;
}) {
  const [{ combo, layout }, session, featuredCombinations, liveSnapshots, tickerItems, liveNowComboCandidates]: [
    Awaited<typeof searchParams>,
    Awaited<ReturnType<typeof getSession>>,
    FeaturedCombination[],
    Awaited<ReturnType<typeof getLiveSnapshots>>,
    Awaited<ReturnType<typeof getTickerItems>>,
    LiveNowComboCandidate[],
  ] = await Promise.all([
    searchParams,
    getSession(),
    prisma.savedCombination.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: [{ favoritesCount: "desc" }, { updatedAt: "desc" }],
      take: 4,
      select: { id: true, publicSlug: true, name: true, description: true, favoritesCount: true },
    }),
    getLiveSnapshots(),
    getTickerItems(),
    prisma.savedCombination.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: [{ favoritesCount: "desc" }, { updatedAt: "desc" }],
      take: 20,
      select: {
        id: true,
        publicSlug: true,
        name: true,
        description: true,
        favoritesCount: true,
        layoutJson: true,
        updatedAt: true,
      },
    }),
  ]);

  const [favoriteChannels, userPreference, selectedCombination]: [
    Array<{ channelId: string }>,
    {
      defaultGridPreset: StoredGridPreset;
      defaultLayoutJson: unknown;
      reducedMotion: boolean;
      tickerEnabled: boolean;
    } | null,
    { publicSlug: string; layoutJson: unknown } | null,
  ] = await Promise.all([
    session
      ? prisma.favoriteChannel.findMany({
          where: {
            userId: session.user.id,
          },
          select: {
            channelId: true,
          },
        })
      : Promise.resolve([]),
    session
      ? prisma.userPreference.findUnique({
          where: {
            userId: session.user.id,
          },
          select: {
            defaultGridPreset: true,
            defaultLayoutJson: true,
            reducedMotion: true,
            tickerEnabled: true,
          },
        })
      : Promise.resolve(null),
    combo
      ? prisma.savedCombination.findFirst({
          where: {
            publicSlug: combo,
            visibility: "PUBLIC",
          },
          select: {
            publicSlug: true,
            layoutJson: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const initialLayout = parseDashboardLayout(userPreference?.defaultLayoutJson ?? null);
  const comboLayout = parseDashboardLayout(selectedCombination?.layoutJson ?? null);
  const sharedLayout = comboLayout ? null : decodeDashboardLayoutShareParam(layout);
  const routeLayout = comboLayout ?? sharedLayout;
  const canonicalShare =
    selectedCombination && comboLayout
      ? {
          publicSlug: selectedCombination.publicSlug,
          layout: comboLayout,
        }
      : null;

  const user = session
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      }
    : null;

  const liveChannelIdSet = new Set(
    Object.entries(liveSnapshots)
      .filter(([, snap]) => snap.isLive)
      .map(([id]) => id),
  );
  const liveNowChannels: RankedChannel[] = rankLiveChannels(channels, liveSnapshots).slice(0, 6);
  const liveNowCombos: RankedCombo[] = rankRelevantCombos(liveNowComboCandidates, liveChannelIdSet).slice(0, 4);

  return (
    <LiveDashboard
      user={user}
      featuredCombinations={featuredCombinations}
      favoriteChannelIds={favoriteChannels.map((item) => item.channelId)}
      initialLiveSnapshots={liveSnapshots}
      initialTickerItems={tickerItems}
      initialPreset={fromStoredGridPreset(userPreference?.defaultGridPreset)}
      initialLayout={initialLayout}
      comboLayout={routeLayout}
      canonicalShare={canonicalShare}
      reducedMotionEnabled={userPreference?.reducedMotion ?? false}
      tickerEnabled={userPreference?.tickerEnabled ?? true}
      liveNowChannels={liveNowChannels}
      liveNowCombos={liveNowCombos}
    />
  );
}
