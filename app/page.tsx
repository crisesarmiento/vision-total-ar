import { LiveDashboard } from "@/components/dashboard/live-dashboard";
import { prisma } from "@/lib/prisma";
import { getTickerItems } from "@/lib/rss";
import { getSession } from "@/lib/session";
import { getLiveSnapshots } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [session, featuredCombinations, liveSnapshots, tickerItems] = await Promise.all([
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

  const favoriteChannels = session
    ? await prisma.favoriteChannel.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          channelId: true,
        },
      })
    : [];

  return (
    <LiveDashboard
      user={
        session
          ? {
              id: session.user.id,
              name: session.user.name,
              image: session.user.image,
            }
          : null
      }
      featuredCombinations={featuredCombinations}
      favoriteChannelIds={favoriteChannels.map((item) => item.channelId)}
      initialLiveSnapshots={liveSnapshots}
      initialTickerItems={tickerItems}
    />
  );
}
