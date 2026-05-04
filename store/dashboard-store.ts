"use client";

import { create } from "zustand";
import type { DashboardLayout, DashboardPlayerTile } from "@/lib/dashboard-layout";
import { DEFAULT_CHANNEL_IDS } from "@/lib/channels";
import { GRID_PRESETS, type LayoutPresetId } from "@/lib/layout-presets";

export type PlayerTile = DashboardPlayerTile;

type DashboardState = {
  layoutPreset: LayoutPresetId;
  players: PlayerTile[];
  globalMuted: boolean;
  focusedPlayerId: string | null;
  setPreset: (preset: LayoutPresetId) => void;
  hydrateLayout: (layout: DashboardLayout) => void;
  reorderPlayers: (activeId: string, overId: string) => void;
  setChannel: (slotId: string, channelId: string) => void;
  toggleMute: (slotId: string) => void;
  setVolume: (slotId: string, volume: number) => void;
  toggleGlobalMute: () => void;
  focusPlayer: (slotId: string | null) => void;
};

const ELECTION_CHANNEL_IDS = ["tn", "c5n", "lnmas", "a24", "canal26", "cronica"] as const;
const DEPORTES_CHANNEL_IDS = ["tycsports", "tnt-sports-ar", "fox-sports-ar", "tycsports"] as const;
const FEDERAL_CHANNEL_IDS = ["el-siete", "el-tres", "tvpublica", "canal-ciudad"] as const;

function makePlayers(maxPlayers: number) {
  return Array.from({ length: maxPlayers }, (_, index) => ({
    slotId: `slot-${index + 1}`,
    channelId: DEFAULT_CHANNEL_IDS[index % DEFAULT_CHANNEL_IDS.length],
    muted: true,
    volume: index === 0 ? 35 : 0,
  }));
}

function makePlayer(slot: number) {
  return {
    slotId: `slot-${slot}`,
    channelId: DEFAULT_CHANNEL_IDS[(slot - 1) % DEFAULT_CHANNEL_IDS.length],
    muted: true,
    volume: slot === 1 ? 35 : 0,
  };
}

function makePlayersFromChannels(channelIds: readonly string[]) {
  return channelIds.map((channelId, index) => ({
    slotId: `slot-${index + 1}`,
    channelId,
    muted: true,
    volume: index === 0 ? 35 : 0,
  }));
}

function fillPlayersToCapacity(players: PlayerTile[], maxPlayers: number) {
  const preservedPlayers = players.slice(0, maxPlayers);
  const usedSlotIds = new Set(preservedPlayers.map((player) => player.slotId));
  const remainingSlots = maxPlayers - preservedPlayers.length;
  const seededPlayers =
    remainingSlots > 0
      ? Array.from({ length: maxPlayers }, (_, index) => index + 1)
          .map((slot) => `slot-${slot}`)
          .filter((slotId) => !usedSlotIds.has(slotId))
          .slice(0, remainingSlots)
          .map((slotId) => makePlayer(Number(slotId.replace("slot-", ""))))
      : [];

  return [...preservedPlayers, ...seededPlayers];
}

function move<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  layoutPreset: "2x2",
  players: makePlayers(GRID_PRESETS[2].maxPlayers),
  globalMuted: true,
  focusedPlayerId: null,
  setPreset: (preset) =>
    set((state) => {
      const config = GRID_PRESETS.find((item) => item.id === preset) ?? GRID_PRESETS[2];
      const players =
        preset === "elecciones"
          ? makePlayersFromChannels(ELECTION_CHANNEL_IDS)
          : preset === "deportes"
            ? makePlayersFromChannels(DEPORTES_CHANNEL_IDS)
            : preset === "federal"
              ? makePlayersFromChannels(FEDERAL_CHANNEL_IDS)
              : fillPlayersToCapacity(state.players, config.maxPlayers);

      return {
        layoutPreset: preset,
        players,
      };
    }),
  hydrateLayout: (layout) =>
    set(() => {
      const config = GRID_PRESETS.find((item) => item.id === layout.preset) ?? GRID_PRESETS[2];
      const players = fillPlayersToCapacity(layout.players, config.maxPlayers);

      return {
        layoutPreset: layout.preset,
        players,
        globalMuted: players.every((player) => player.muted),
        focusedPlayerId: null,
      };
    }),
  reorderPlayers: (activeId, overId) =>
    set((state) => {
      const activeIndex = state.players.findIndex((player) => player.slotId === activeId);
      const overIndex = state.players.findIndex((player) => player.slotId === overId);

      if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
        return state;
      }

      return {
        players: move(state.players, activeIndex, overIndex),
      };
    }),
  setChannel: (slotId, channelId) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.slotId === slotId ? { ...player, channelId } : player,
      ),
    })),
  toggleMute: (slotId) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.slotId === slotId ? { ...player, muted: !player.muted } : player,
      ),
    })),
  setVolume: (slotId, volume) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.slotId === slotId ? { ...player, volume, muted: volume === 0 } : player,
      ),
    })),
  toggleGlobalMute: () =>
    set((state) => ({
      globalMuted: !state.globalMuted,
      players: state.players.map((player) => ({
        ...player,
        muted: !state.globalMuted,
      })),
    })),
  focusPlayer: (slotId) =>
    set(() => ({
      focusedPlayerId: slotId,
    })),
}));
