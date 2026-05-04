"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { buildForkPayload } from "@/lib/combination-fork";
import { dashboardLayoutSchema } from "@/lib/dashboard-layout";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const combinationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(60),
  description: z.string().max(240).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]),
  layoutJson: dashboardLayoutSchema,
});

export async function saveCombination(input: z.infer<typeof combinationSchema>) {
  const session = await requireSession();
  const payload = combinationSchema.parse(input);

  if (payload.id) {
    const owned = await prisma.savedCombination.findFirst({
      where: { id: payload.id, ownerId: session.user.id },
      select: { id: true },
    });
    if (!owned) throw new Error("No encontramos esa combinación.");
  }

  const combination = await prisma.savedCombination.upsert({
    where: {
      id: payload.id ?? "",
    },
    update: {
      name: payload.name,
      description: payload.description,
      visibility: payload.visibility,
      layoutJson: payload.layoutJson,
    },
    create: {
      ownerId: session.user.id,
      name: payload.name,
      description: payload.description,
      visibility: payload.visibility,
      layoutJson: payload.layoutJson,
    },
  });

  revalidatePath("/");
  revalidatePath("/mis-combinaciones");
  revalidatePath(`/combo/${combination.publicSlug}`);

  return combination;
}

export async function forkPublicCombination(sourceId: string) {
  const session = await requireSession();

  const source = await prisma.savedCombination.findFirst({
    where: {
      id: sourceId,
      visibility: "PUBLIC",
    },
    select: {
      id: true,
      publicSlug: true,
      name: true,
      description: true,
      layoutJson: true,
    },
  });

  if (!source) {
    throw new Error("No encontramos esa combinación pública.");
  }

  const fork = await prisma.savedCombination.create({
    data: buildForkPayload(source, session.user.id),
    select: {
      id: true,
      publicSlug: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/mis-combinaciones");
  revalidatePath(`/combo/${source.publicSlug}`);

  return fork;
}

export async function deleteCombination(id: string) {
  const session = await requireSession();

  await prisma.savedCombination.deleteMany({
    where: {
      id,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/mis-combinaciones");
}

export async function markCombinationAsUsed(combinationId: string) {
  const session = await requireSession();

  await prisma.recentCombination.upsert({
    where: {
      userId_combinationId: {
        userId: session.user.id,
        combinationId,
      },
    },
    update: {
      lastViewedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      combinationId,
    },
  });
}

export async function toggleFavoriteChannel(channelId: string) {
  const session = await requireSession();
  const existing = await prisma.favoriteChannel.findUnique({
    where: {
      userId_channelId: {
        userId: session.user.id,
        channelId,
      },
    },
  });

  if (existing) {
    await prisma.favoriteChannel.delete({
      where: {
        userId_channelId: {
          userId: session.user.id,
          channelId,
        },
      },
    });
  } else {
    await prisma.favoriteChannel.create({
      data: {
        userId: session.user.id,
        channelId,
      },
    });
  }

  revalidatePath("/");

  return !existing;
}

export async function toggleFavoriteCombination(combinationId: string) {
  const session = await requireSession();
  const combination = await prisma.savedCombination.findFirst({
    where: {
      id: combinationId,
      visibility: "PUBLIC",
    },
    select: {
      id: true,
      publicSlug: true,
    },
  });

  if (!combination) {
    throw new Error("No encontramos esa combinación pública.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.favoritedCombination.findUnique({
      where: {
        userId_combinationId: {
          userId: session.user.id,
          combinationId,
        },
      },
    });

    if (existing) {
      await tx.favoritedCombination.delete({
        where: {
          userId_combinationId: {
            userId: session.user.id,
            combinationId,
          },
        },
      });

      const updated = await tx.savedCombination.update({
        where: {
          id: combinationId,
        },
        data: {
          favoritesCount: {
            decrement: 1,
          },
        },
        select: {
          favoritesCount: true,
        },
      });

      return {
        favorited: false,
        favoritesCount: updated.favoritesCount,
      };
    }

    await tx.favoritedCombination.create({
      data: {
        userId: session.user.id,
        combinationId,
      },
    });

    const updated = await tx.savedCombination.update({
      where: {
        id: combinationId,
      },
      data: {
        favoritesCount: {
          increment: 1,
        },
      },
      select: {
        favoritesCount: true,
      },
    });

    return {
      favorited: true,
      favoritesCount: updated.favoritesCount,
    };
  });

  revalidatePath("/");
  revalidatePath(`/combo/${combination.publicSlug}`);

  return result;
}

const MAX_SECONDS_WATCHED_PER_SESSION = 3600;

export async function trackChannelView(channelId: string, secondsWatched = 15) {
  const session = await requireSession();
  const clampedSeconds = Math.min(Math.max(0, secondsWatched), MAX_SECONDS_WATCHED_PER_SESSION);

  await prisma.channelAnalytics.upsert({
    where: {
      userId_channelId: {
        userId: session.user.id,
        channelId,
      },
    },
    update: {
      sessionsCount: {
        increment: 1,
      },
      secondsWatched: {
        increment: clampedSeconds,
      },
      lastWatchedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      channelId,
      sessionsCount: 1,
      secondsWatched: clampedSeconds,
      lastWatchedAt: new Date(),
    },
  });
}
