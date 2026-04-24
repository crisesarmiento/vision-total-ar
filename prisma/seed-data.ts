import type { DashboardLayout } from "../lib/dashboard-layout";

export const DEMO_PASSWORD_PARTS = ["Vision", "AR", "123", "!"] as const;

export type SeedUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export type SeedCombination = {
  id: string;
  ownerEmail: string;
  publicSlug: string;
  name: string;
  description: string;
  visibility: "PUBLIC" | "PRIVATE";
  layoutJson: DashboardLayout;
};

export type SeedFavoriteCombination = {
  userEmail: string;
  combinationSlug: string;
};

export type SeedRecentCombination = {
  userEmail: string;
  combinationSlug: string;
  lastViewedAt: Date;
};

export type SeedChannelAnalytics = {
  userEmail: string;
  channelId: string;
  sessionsCount: number;
  secondsWatched: number;
  lastWatchedAt: Date;
};

function layout(
  preset: DashboardLayout["preset"],
  channelIds: string[],
): DashboardLayout {
  return {
    preset,
    players: channelIds.map((channelId, index) => ({
      slotId: `slot-${index + 1}`,
      channelId,
      muted: index !== 0,
      volume: index === 0 ? 35 : 0,
    })),
  };
}

const now = new Date("2026-04-24T00:00:00.000Z");

export const seedUsers: SeedUser[] = [
  {
    id: "seed-user-demo",
    email: "demo@visionar.local",
    name: "Demo Vision AR",
    image: null,
  },
  {
    id: "seed-user-ana",
    email: "ana@visionar.local",
    name: "Ana Productora",
    image: null,
  },
  {
    id: "seed-user-editor",
    email: "editor@visionar.local",
    name: "Editor Noticias",
    image: null,
  },
];

export const seedFavoriteChannels = [
  { userEmail: "demo@visionar.local", channelId: "tn" },
  { userEmail: "demo@visionar.local", channelId: "c5n" },
  { userEmail: "demo@visionar.local", channelId: "lnmas" },
  { userEmail: "demo@visionar.local", channelId: "cronica" },
  { userEmail: "demo@visionar.local", channelId: "blender" },
];

export const seedPreference = {
  userEmail: "demo@visionar.local",
  defaultGridPreset: "GRID_2X2" as const,
  defaultLayoutJson: layout("2x2", ["tn", "c5n", "lnmas", "a24"]),
};

export const seedCombinations: SeedCombination[] = [
  {
    id: "seed-combo-news",
    ownerEmail: "demo@visionar.local",
    publicSlug: "demo-mesa-de-noticias",
    name: "Mesa de noticias",
    description: "Cuatro senales nacionales para comparar agenda en vivo.",
    visibility: "PUBLIC",
    layoutJson: layout("2x2", ["tn", "c5n", "lnmas", "a24"]),
  },
  {
    id: "seed-combo-elecciones",
    ownerEmail: "demo@visionar.local",
    publicSlug: "demo-modo-elecciones",
    name: "Modo Elecciones",
    description: "Seis canales principales para cobertura electoral.",
    visibility: "PUBLIC",
    layoutJson: layout("elecciones", [
      "tn",
      "c5n",
      "lnmas",
      "a24",
      "canal26",
      "cronica",
    ]),
  },
  {
    id: "seed-combo-streaming",
    ownerEmail: "demo@visionar.local",
    publicSlug: "demo-streaming-independiente",
    name: "Streaming independiente",
    description: "Canales digitales argentinos en paralelo.",
    visibility: "PUBLIC",
    layoutJson: layout("2x2", ["luzu", "olga", "bondi", "blender"]),
  },
  {
    id: "seed-combo-private-control-room",
    ownerEmail: "demo@visionar.local",
    publicSlug: "demo-control-room-privado",
    name: "Control room privado",
    description: "Layout privado para probar Mis combinaciones.",
    visibility: "PRIVATE",
    layoutJson: layout("3x3", [
      "tn",
      "c5n",
      "lnmas",
      "a24",
      "canal26",
      "cronica",
      "ip",
      "america",
      "telefe",
    ]),
  },
];

export const seedFavoriteCombinations: SeedFavoriteCombination[] = [
  { userEmail: "ana@visionar.local", combinationSlug: "demo-mesa-de-noticias" },
  {
    userEmail: "editor@visionar.local",
    combinationSlug: "demo-mesa-de-noticias",
  },
  { userEmail: "demo@visionar.local", combinationSlug: "demo-modo-elecciones" },
  { userEmail: "ana@visionar.local", combinationSlug: "demo-modo-elecciones" },
  {
    userEmail: "editor@visionar.local",
    combinationSlug: "demo-streaming-independiente",
  },
];

export const seedRecentCombinations: SeedRecentCombination[] = [
  {
    userEmail: "demo@visionar.local",
    combinationSlug: "demo-mesa-de-noticias",
    lastViewedAt: new Date(now.getTime() - 60 * 60 * 1000),
  },
  {
    userEmail: "demo@visionar.local",
    combinationSlug: "demo-modo-elecciones",
    lastViewedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
  },
  {
    userEmail: "demo@visionar.local",
    combinationSlug: "demo-streaming-independiente",
    lastViewedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
  },
];

export const seedChannelAnalytics: SeedChannelAnalytics[] = [
  {
    userEmail: "demo@visionar.local",
    channelId: "tn",
    sessionsCount: 14,
    secondsWatched: 18_600,
    lastWatchedAt: new Date(now.getTime() - 30 * 60 * 1000),
  },
  {
    userEmail: "demo@visionar.local",
    channelId: "c5n",
    sessionsCount: 11,
    secondsWatched: 14_400,
    lastWatchedAt: new Date(now.getTime() - 45 * 60 * 1000),
  },
  {
    userEmail: "demo@visionar.local",
    channelId: "blender",
    sessionsCount: 6,
    secondsWatched: 7_200,
    lastWatchedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
  },
];

export function expectedSeedFavoriteCounts() {
  return seedFavoriteCombinations.reduce<Record<string, number>>(
    (counts, favorite) => {
      counts[favorite.combinationSlug] =
        (counts[favorite.combinationSlug] ?? 0) + 1;
      return counts;
    },
    {},
  );
}
