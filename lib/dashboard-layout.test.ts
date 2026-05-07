import { describe, expect, it } from "vitest";
import {
  decodeDashboardLayoutShareParam,
  encodeDashboardLayoutShareParam,
  MAX_SHARED_LAYOUT_PARAM_LENGTH,
  type DashboardLayout,
} from "./dashboard-layout";

function makeLayout(channelIds: string[], preset: DashboardLayout["preset"] = "2x2") {
  return {
    preset,
    players: channelIds.map((channelId, index) => ({
      slotId: `slot-${index + 1}`,
      channelId,
      muted: true,
      volume: index === 0 ? 35 : 0,
    })),
  };
}

describe("dashboard layout sharing", () => {
  it("round-trips valid layouts through an encoded URL parameter", () => {
    const layout = makeLayout(["tn", "c5n", "lnmas", "a24"]);

    const encodedLayout = encodeDashboardLayoutShareParam(layout);

    expect(decodeDashboardLayoutShareParam(encodedLayout)).toEqual(layout);
  });

  it("parses layouts that were already decoded by route search params", () => {
    const layout = makeLayout(["tn", "c5n"]);

    expect(decodeDashboardLayoutShareParam(JSON.stringify(layout))).toEqual(layout);
  });

  it("rejects invalid JSON payloads", () => {
    expect(decodeDashboardLayoutShareParam("%7Bbad-json")).toBeNull();
  });

  it("rejects unsupported presets", () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        ...makeLayout(["tn"]),
        preset: "split-screen",
      }),
    );

    expect(decodeDashboardLayoutShareParam(payload)).toBeNull();
  });

  it("rejects unknown channel ids inside the selected preset capacity", () => {
    const payload = encodeURIComponent(
      JSON.stringify(makeLayout(["tn", "missing-channel"])),
    );

    expect(decodeDashboardLayoutShareParam(payload)).toBeNull();
  });

  it("rejects oversized payloads", () => {
    expect(
      decodeDashboardLayoutShareParam("x".repeat(MAX_SHARED_LAYOUT_PARAM_LENGTH + 1)),
    ).toBeNull();
  });

  it("caps shared players to the selected preset capacity", () => {
    const layout = makeLayout(["tn", "c5n", "lnmas", "a24", "cronica"], "2x2");

    expect(decodeDashboardLayoutShareParam(encodeDashboardLayoutShareParam(layout))).toEqual(
      makeLayout(["tn", "c5n", "lnmas", "a24"], "2x2"),
    );
  });
});
