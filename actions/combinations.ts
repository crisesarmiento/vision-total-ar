"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const combinationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(60),
  description: z.string().max(240).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]),
  layoutJson: z.any(),
});

export async function saveCombination(input: z.infer<typeof combinationSchema>) {
  const session = await requireSession();
  const payload = combinationSchema.parse(input);

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

export async function trackChannelView(channelId: string, secondsWatched = 15) {
  const session = await requireSession();

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
        increment: secondsWatched,
      },
      lastWatchedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      channelId,
      sessionsCount: 1,
      secondsWatched,
      lastWatchedAt: new Date(),
    },
  });
}
