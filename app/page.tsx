import { LiveDashboard } from "@/components/dashboard/live-dashboard";
import { parseDashboardLayout } from "@/lib/dashboard-layout";
import { fromStoredGridPreset, type StoredGridPreset } from "@/lib/layout-presets";
import { prisma } from "@/lib/prisma";
import { getTickerItems } from "@/lib/rss";
import { getSession } from "@/lib/session";
import { getLiveSnapshots } from "@/lib/youtube";

export const dynamic = "force-dynamic";

type FeaturedCombination = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  favoritesCount: number;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ combo?: string }>;
}) {
  const [{ combo }, session, featuredCombinations, liveSnapshots, tickerItems]: [
    Awaited<typeof searchParams>,
    Awaited<ReturnType<typeof getSession>>,
    FeaturedCombination[],
    Awaited<ReturnType<typeof getLiveSnapshots>>,
    Awaited<ReturnType<typeof getTickerItems>>,
  ] = await Promise.all([
    searchParams,
    getSession(),
    prisma.savedCombination.findMany({
      where: {
        visibility: "PUBLIC",
      },
      orderBy: [{ favoritesCount: "desc" }, { updatedAt: "desc" }],
      take: 4,
      select: {
        id: true,
        publicSlug: true,
        name: true,
        description: true,
        favoritesCount: true,
      },
    }),
    getLiveSnapshots(),
    getTickerItems(),
  ]);

  const [favoriteChannels, userPreference, selectedCombination]: [
    Array<{ channelId: string }>,
    {
      defaultGridPreset: StoredGridPreset;
      defaultLayoutJson: unknown;
      reducedMotion: boolean;
      tickerEnabled: boolean;
    } | null,
    { layoutJson: unknown } | null,
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
            layoutJson: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const initialLayout = parseDashboardLayout(userPreference?.defaultLayoutJson ?? null);
  const comboLayout = parseDashboardLayout(selectedCombination?.layoutJson ?? null);

  const user = session
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      }
    : null;

  return (
    <LiveDashboard
      user={user}
      featuredCombinations={featuredCombinations}
      favoriteChannelIds={favoriteChannels.map((item) => item.channelId)}
      initialLiveSnapshots={liveSnapshots}
      initialTickerItems={tickerItems}
      initialPreset={fromStoredGridPreset(userPreference?.defaultGridPreset)}
      initialLayout={initialLayout}
      comboLayout={comboLayout}
      reducedMotionEnabled={userPreference?.reducedMotion ?? false}
      tickerEnabled={userPreference?.tickerEnabled ?? true}
    />
  );
}
