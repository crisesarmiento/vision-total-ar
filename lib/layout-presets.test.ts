import { describe, expect, it } from "vitest";
import { fromStoredGridPreset } from "./layout-presets";

describe("fromStoredGridPreset", () => {
  it("falls back to 2x2 when no stored preset exists", () => {
    expect(fromStoredGridPreset(null)).toBe("2x2");
    expect(fromStoredGridPreset(undefined)).toBe("2x2");
  });

  it("normalizes CUSTOM to the supported default preset", () => {
    expect(fromStoredGridPreset("CUSTOM")).toBe("2x2");
  });

  it("maps stored presets back to dashboard presets", () => {
    expect(fromStoredGridPreset("GRID_1")).toBe("1x1");
    expect(fromStoredGridPreset("GRID_2X1")).toBe("2x1");
    expect(fromStoredGridPreset("GRID_2X2")).toBe("2x2");
    expect(fromStoredGridPreset("GRID_3X3")).toBe("3x3");
    expect(fromStoredGridPreset("GRID_4X4")).toBe("4x4");
  });
});
