import { describe, expect, it } from "vitest";
import { GRID_PRESETS, getPresetById } from "./layout-presets";

describe("layout presets", () => {
  it("returns the recommended default preset when the requested one is missing", () => {
    expect(getPresetById("custom")).toEqual(GRID_PRESETS[2]);
  });

  it("keeps the 4x4 preset capped to 12 players", () => {
    const preset = getPresetById("4x4");

    expect(preset.maxPlayers).toBe(12);
    expect(preset.columns).toBe(4);
  });
});
