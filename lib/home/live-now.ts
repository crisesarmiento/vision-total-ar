import { parseDashboardLayout } from "@/lib/dashboard-layout";
import type { NewsChannel } from "@/lib/channels";
import type { LiveChannelSnapshot } from "@/lib/youtube";

export type RankedChannel = {
  id: string;
  name: string;
  shortName: string;
  accent: string;
  viewerCount: number | null;
  startedAt: string | null;
};

export type RankedCombo = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  favoritesCount: number;
  liveChannelCount: number;
  totalChannelCount: number;
};

export const SCORE_WEIGHTS = {
  live: 3,
  fav: 1,
  recency: 0.5,
  halfLifeDays: 7,
} as const;

export function rankLiveChannels(
  allChannels: NewsChannel[],
  snapshots: Record<string, LiveChannelSnapshot>,
): RankedChannel[] {
  return allChannels
    .filter((ch) => snapshots[ch.id]?.isLive)
    .map((ch) => ({
      id: ch.id,
      name: ch.name,
      shortName: ch.shortName,
      accent: ch.accent,
      viewerCount: snapshots[ch.id]?.viewerCount ?? null,
      startedAt: snapshots[ch.id]?.startedAt ?? null,
    }))
    .sort((a, b) => (b.viewerCount ?? 0) - (a.viewerCount ?? 0));
}

export function scoreCombo(
  combo: { liveChannelCount: number; favoritesCount: number; updatedAt: Date },
  now: Date = new Date(),
): number {
  const daysSince =
    (now.getTime() - combo.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recency = Math.pow(0.5, daysSince / SCORE_WEIGHTS.halfLifeDays);
  return (
    SCORE_WEIGHTS.live * combo.liveChannelCount +
    SCORE_WEIGHTS.fav * Math.log1p(combo.favoritesCount) +
    SCORE_WEIGHTS.recency * recency
  );
}

type ComboCandidate = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  favoritesCount: number;
  layoutJson: unknown;
  updatedAt: Date;
};

export function rankRelevantCombos(
  combos: ComboCandidate[],
  liveChannelIdSet: Set<string>,
  now: Date = new Date(),
): RankedCombo[] {
  const scored = combos.map((combo) => {
    const layout = parseDashboardLayout(combo.layoutJson);
    const channelIds = layout?.players.map((p) => p.channelId) ?? [];
    const liveChannelCount = channelIds.filter((id) => liveChannelIdSet.has(id)).length;
    const totalChannelCount = channelIds.length;
    return {
      id: combo.id,
      publicSlug: combo.publicSlug,
      name: combo.name,
      description: combo.description,
      favoritesCount: combo.favoritesCount,
      liveChannelCount,
      totalChannelCount,
      _score: scoreCombo(
        { liveChannelCount, favoritesCount: combo.favoritesCount, updatedAt: combo.updatedAt },
        now,
      ),
    };
  });

  return scored
    .sort((a, b) => b._score - a._score)
    .map(({ _score: _, ...rest }) => rest);
}
