import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { createPrismaClient, getConnectionString } from "../lib/prisma-client";
import {
  DEMO_PASSWORD_PARTS,
  seedChannelAnalytics,
  seedCombinations,
  seedFavoriteChannels,
  seedFavoriteCombinations,
  seedPreference,
  seedRecentCombinations,
  seedUsers,
} from "./seed-data";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "db"]);

function assertSafeSeedTarget(connectionString: string) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  ) {
    throw new Error("Refusing to seed while NODE_ENV/VERCEL_ENV is production.");
  }

  const url = new URL(connectionString);
  const isLocal = LOCAL_HOSTS.has(url.hostname);
  const remoteAllowed = process.env.DATABASE_SEED_ALLOW_REMOTE === "true";

  if (!isLocal && !remoteAllowed) {
    throw new Error(
      `Refusing to seed remote database host "${url.hostname}". Set DATABASE_SEED_ALLOW_REMOTE=true for Neon preview/dev databases.`,
    );
  }

  console.info(`[seed] target database host: ${url.hostname}`);
}

function getDemoPassword() {
  return process.env.SEED_DEMO_PASSWORD ?? DEMO_PASSWORD_PARTS.join("");
}

async function upsertUsers(prisma: PrismaClient) {
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        image: user.image,
        emailVerified: true,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: true,
      },
    });
  }
}

async function upsertCredentialAccounts(
  prisma: PrismaClient,
  userIds: Map<string, string>,
) {
  const password = await hashPassword(getDemoPassword());

  for (const user of seedUsers) {
    const userId = getRequiredId(userIds, user.email, "user");

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: userId,
        },
      },
      update: {
        userId,
        password,
      },
      create: {
        userId,
        providerId: "credential",
        accountId: userId,
        password,
      },
    });
  }
}

async function userIdByEmail(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: seedUsers.map((user) => user.email),
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  return new Map(users.map((user) => [user.email, user.id]));
}

function getRequiredId(ids: Map<string, string>, key: string, label: string) {
  const id = ids.get(key);

  if (!id) {
    throw new Error(`Missing seeded ${label}: ${key}`);
  }

  return id;
}

async function upsertPreference(prisma: PrismaClient, userIds: Map<string, string>) {
  const userId = getRequiredId(userIds, seedPreference.userEmail, "user");

  await prisma.userPreference.upsert({
    where: { userId },
    update: {
      defaultGridPreset: seedPreference.defaultGridPreset,
      defaultLayoutJson: seedPreference.defaultLayoutJson,
      tickerEnabled: true,
      keyboardShortcutsEnabled: true,
      notificationsEnabled: true,
      reducedMotion: false,
      theme: "SYSTEM",
    },
    create: {
      userId,
      defaultGridPreset: seedPreference.defaultGridPreset,
      defaultLayoutJson: seedPreference.defaultLayoutJson,
      tickerEnabled: true,
      keyboardShortcutsEnabled: true,
      notificationsEnabled: true,
      reducedMotion: false,
      theme: "SYSTEM",
    },
  });
}

async function upsertFavoriteChannels(
  prisma: PrismaClient,
  userIds: Map<string, string>,
) {
  for (const favorite of seedFavoriteChannels) {
    const userId = getRequiredId(userIds, favorite.userEmail, "user");

    await prisma.favoriteChannel.upsert({
      where: {
        userId_channelId: {
          userId,
          channelId: favorite.channelId,
        },
      },
      update: {},
      create: {
        userId,
        channelId: favorite.channelId,
      },
    });
  }
}

async function upsertCombinations(
  prisma: PrismaClient,
  userIds: Map<string, string>,
) {
  for (const combination of seedCombinations) {
    const ownerId = getRequiredId(userIds, combination.ownerEmail, "user");

    await prisma.savedCombination.upsert({
      where: {
        publicSlug: combination.publicSlug,
      },
      update: {
        ownerId,
        name: combination.name,
        description: combination.description,
        layoutJson: combination.layoutJson,
        visibility: combination.visibility,
      },
      create: {
        id: combination.id,
        publicSlug: combination.publicSlug,
        ownerId,
        name: combination.name,
        description: combination.description,
        layoutJson: combination.layoutJson,
        visibility: combination.visibility,
      },
    });
  }
}

async function combinationIdBySlug(prisma: PrismaClient) {
  const combinations = await prisma.savedCombination.findMany({
    where: {
      publicSlug: {
        in: seedCombinations.map((combination) => combination.publicSlug),
      },
    },
    select: {
      id: true,
      publicSlug: true,
    },
  });

  return new Map(
    combinations.map((combination) => [
      combination.publicSlug,
      combination.id,
    ]),
  );
}

async function upsertFavoriteCombinations(
  prisma: PrismaClient,
  userIds: Map<string, string>,
  combinationIds: Map<string, string>,
) {
  for (const favorite of seedFavoriteCombinations) {
    const userId = getRequiredId(userIds, favorite.userEmail, "user");
    const combinationId = getRequiredId(
      combinationIds,
      favorite.combinationSlug,
      "combination",
    );

    await prisma.favoritedCombination.upsert({
      where: {
        userId_combinationId: {
          userId,
          combinationId,
        },
      },
      update: {},
      create: {
        userId,
        combinationId,
      },
    });
  }

  for (const combination of seedCombinations) {
    const combinationId = getRequiredId(
      combinationIds,
      combination.publicSlug,
      "combination",
    );
    const favoritesCount = await prisma.favoritedCombination.count({
      where: { combinationId },
    });

    await prisma.savedCombination.update({
      where: { id: combinationId },
      data: { favoritesCount },
    });
  }
}

async function upsertRecentCombinations(
  prisma: PrismaClient,
  userIds: Map<string, string>,
  combinationIds: Map<string, string>,
) {
  for (const recent of seedRecentCombinations) {
    const userId = getRequiredId(userIds, recent.userEmail, "user");
    const combinationId = getRequiredId(
      combinationIds,
      recent.combinationSlug,
      "combination",
    );

    await prisma.recentCombination.upsert({
      where: {
        userId_combinationId: {
          userId,
          combinationId,
        },
      },
      update: {
        lastViewedAt: recent.lastViewedAt,
      },
      create: {
        userId,
        combinationId,
        createdAt: recent.lastViewedAt,
        lastViewedAt: recent.lastViewedAt,
      },
    });
  }
}

async function upsertChannelAnalytics(
  prisma: PrismaClient,
  userIds: Map<string, string>,
) {
  for (const analytics of seedChannelAnalytics) {
    const userId = getRequiredId(userIds, analytics.userEmail, "user");

    await prisma.channelAnalytics.upsert({
      where: {
        userId_channelId: {
          userId,
          channelId: analytics.channelId,
        },
      },
      update: {
        sessionsCount: analytics.sessionsCount,
        secondsWatched: analytics.secondsWatched,
        lastWatchedAt: analytics.lastWatchedAt,
      },
      create: {
        userId,
        channelId: analytics.channelId,
        sessionsCount: analytics.sessionsCount,
        secondsWatched: analytics.secondsWatched,
        lastWatchedAt: analytics.lastWatchedAt,
      },
    });
  }
}

async function main() {
  const connectionString = getConnectionString();
  assertSafeSeedTarget(connectionString);
  const prisma = createPrismaClient();

  try {
    await upsertUsers(prisma);
    const userIds = await userIdByEmail(prisma);

    await upsertCredentialAccounts(prisma, userIds);
    await upsertPreference(prisma, userIds);
    await upsertFavoriteChannels(prisma, userIds);
    await upsertCombinations(prisma, userIds);

    const combinationIds = await combinationIdBySlug(prisma);

    await upsertFavoriteCombinations(prisma, userIds, combinationIds);
    await upsertRecentCombinations(prisma, userIds, combinationIds);
    await upsertChannelAnalytics(prisma, userIds);

    console.info(
      `[seed] demo login: demo@visionar.local / ${getDemoPassword()}`,
    );
    console.info(
      `[seed] upserted ${seedUsers.length} users and ${seedCombinations.length} combinations.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[seed] failed", error);
  process.exit(1);
});
