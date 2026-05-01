import { describe, expect, it } from "vitest";
import { decodeDashboardLayoutShareParam } from "./dashboard-layout";
import { getDashboardSharePath, getDashboardShareUrl } from "./dashboard-share";
import type { DashboardLayout } from "./dashboard-layout";

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

describe("dashboard share URLs", () => {
  it("uses the canonical public combo path when the current layout still matches", () => {
    const layout = makeLayout(["tn", "c5n", "lnmas", "a24"]);

    expect(
      getDashboardSharePath(layout, {
        publicSlug: "mesa-de-noticias",
        layout,
      }),
    ).toBe("/combo/mesa-de-noticias");
  });

  it("uses an encoded layout URL when the current layout differs from the source combo", () => {
    const path = getDashboardSharePath(makeLayout(["tn", "c5n", "lnmas", "cronica"]), {
      publicSlug: "mesa-de-noticias",
      layout: makeLayout(["tn", "c5n", "lnmas", "a24"]),
    });
    const encodedLayout = path.replace("/?layout=", "");

    expect(path).toMatch(/^\/\?layout=/);
    expect(decodeDashboardLayoutShareParam(encodedLayout)).toEqual(
      makeLayout(["tn", "c5n", "lnmas", "cronica"]),
    );
  });

  it("builds same-origin absolute URLs for browser sharing", () => {
    expect(getDashboardShareUrl("https://vision.example", makeLayout(["tn"]))).toMatch(
      /^https:\/\/vision\.example\/\?layout=/,
    );
  });
});
