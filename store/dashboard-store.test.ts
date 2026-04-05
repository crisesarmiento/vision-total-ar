import { beforeEach, describe, expect, it } from "vitest";
import { useDashboardStore, type PlayerTile } from "./dashboard-store";

const initialState = {
  layoutPreset: useDashboardStore.getState().layoutPreset,
  players: structuredClone(useDashboardStore.getState().players),
  globalMuted: useDashboardStore.getState().globalMuted,
  focusedPlayerId: useDashboardStore.getState().focusedPlayerId,
};

function makePlayer(slot: number, channelId: string): PlayerTile {
  return {
    slotId: `slot-${slot}`,
    channelId,
    muted: slot % 2 === 0,
    volume: slot * 10,
  };
}

describe("dashboard store setPreset", () => {
  beforeEach(() => {
    useDashboardStore.setState({
      layoutPreset: initialState.layoutPreset,
      players: structuredClone(initialState.players),
      globalMuted: initialState.globalMuted,
      focusedPlayerId: initialState.focusedPlayerId,
    });
  });

  it("preserves existing player assignments when expanding the grid", () => {
    useDashboardStore.setState({
      layoutPreset: "2x2",
      players: [
        makePlayer(1, "lnmas"),
        makePlayer(2, "tn"),
        makePlayer(3, "c5n"),
        makePlayer(4, "a24"),
      ],
    });

    useDashboardStore.getState().setPreset("3x3");

    expect(useDashboardStore.getState().players).toEqual([
      makePlayer(1, "lnmas"),
      makePlayer(2, "tn"),
      makePlayer(3, "c5n"),
      makePlayer(4, "a24"),
      { slotId: "slot-5", channelId: "tn", muted: true, volume: 0 },
      { slotId: "slot-6", channelId: "c5n", muted: true, volume: 0 },
      { slotId: "slot-7", channelId: "lnmas", muted: true, volume: 0 },
      { slotId: "slot-8", channelId: "a24", muted: true, volume: 0 },
      { slotId: "slot-9", channelId: "tn", muted: true, volume: 0 },
    ]);
  });

  it("keeps only the first N players when shrinking the grid", () => {
    useDashboardStore.setState({
      layoutPreset: "3x3",
      players: [
        makePlayer(1, "lnmas"),
        makePlayer(2, "tn"),
        makePlayer(3, "c5n"),
        makePlayer(4, "a24"),
        makePlayer(5, "cronica"),
        makePlayer(6, "canal26"),
        makePlayer(7, "ip"),
        makePlayer(8, "c5n"),
        makePlayer(9, "tn"),
      ],
    });

    useDashboardStore.getState().setPreset("2x2");

    expect(useDashboardStore.getState().players).toEqual([
      makePlayer(1, "lnmas"),
      makePlayer(2, "tn"),
      makePlayer(3, "c5n"),
      makePlayer(4, "a24"),
    ]);
  });

  it("does not create duplicate slot ids after reorder, shrink, and expand", () => {
    useDashboardStore.setState({
      layoutPreset: "2x2",
      players: [
        makePlayer(4, "a24"),
        makePlayer(1, "lnmas"),
        makePlayer(2, "tn"),
        makePlayer(3, "c5n"),
      ],
    });

    useDashboardStore.getState().setPreset("1x1");
    useDashboardStore.getState().setPreset("2x2");

    expect(useDashboardStore.getState().players).toEqual([
      makePlayer(4, "a24"),
      { slotId: "slot-1", channelId: "tn", muted: true, volume: 35 },
      { slotId: "slot-2", channelId: "c5n", muted: true, volume: 0 },
      { slotId: "slot-3", channelId: "lnmas", muted: true, volume: 0 },
    ]);
  });

  it("does not exceed the target capacity when shrinking a reordered layout", () => {
    useDashboardStore.setState({
      layoutPreset: "3x3",
      players: [
        makePlayer(9, "tn"),
        makePlayer(1, "lnmas"),
        makePlayer(2, "c5n"),
        makePlayer(3, "a24"),
        makePlayer(4, "cronica"),
        makePlayer(5, "canal26"),
        makePlayer(6, "ip"),
        makePlayer(7, "c5n"),
        makePlayer(8, "tn"),
      ],
    });

    useDashboardStore.getState().setPreset("2x2");

    expect(useDashboardStore.getState().players).toEqual([
      makePlayer(9, "tn"),
      makePlayer(1, "lnmas"),
      makePlayer(2, "c5n"),
      makePlayer(3, "a24"),
    ]);
    expect(useDashboardStore.getState().players).toHaveLength(4);
  });
});
