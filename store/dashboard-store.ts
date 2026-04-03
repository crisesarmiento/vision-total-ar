"use client";

import { create } from "zustand";
import { DEFAULT_CHANNEL_IDS } from "@/lib/channels";
import { GRID_PRESETS, type LayoutPresetId } from "@/lib/layout-presets";

export type PlayerTile = {
  slotId: string;
  channelId: string;
  muted: boolean;
  volume: number;
};

type DashboardState = {
  layoutPreset: LayoutPresetId;
  players: PlayerTile[];
  globalMuted: boolean;
  focusedPlayerId: string | null;
  setPreset: (preset: LayoutPresetId) => void;
  reorderPlayers: (activeId: string, overId: string) => void;
  setChannel: (slotId: string, channelId: string) => void;
  toggleMute: (slotId: string) => void;
  setVolume: (slotId: string, volume: number) => void;
  toggleGlobalMute: () => void;
  focusPlayer: (slotId: string | null) => void;
};

function makePlayers(maxPlayers: number) {
  return Array.from({ length: maxPlayers }, (_, index) => ({
    slotId: `slot-${index + 1}`,
    channelId: DEFAULT_CHANNEL_IDS[index % DEFAULT_CHANNEL_IDS.length],
    muted: true,
    volume: index === 0 ? 35 : 0,
  }));
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
    set(() => {
      const config = GRID_PRESETS.find((item) => item.id === preset) ?? GRID_PRESETS[2];
      const seededPlayers = makePlayers(config.maxPlayers);

      return {
        layoutPreset: preset,
        players:
          preset === "custom"
            ? seededPlayers
            : seededPlayers.slice(0, Math.min(12, config.maxPlayers)),
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
