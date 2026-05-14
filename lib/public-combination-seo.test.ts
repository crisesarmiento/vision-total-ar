import { describe, expect, it } from "vitest";
import {
  PUBLIC_COMBINATION_MIN_DESCRIPTION_LENGTH,
  analyzePublicCombinationSeo,
  getPublicCombinationRoute,
} from "./public-combination-seo";

function makeDescription() {
  return "Curaduría pública con señales argentinas para comparar coberturas de noticias en vivo durante una agenda intensa.";
}

function makeLayout(channelIds: string[]) {
  return {
    preset: "2x2",
    players: channelIds.map((channelId, index) => ({
      slotId: `slot-${index + 1}`,
      channelId,
      muted: true,
      volume: 0,
    })),
  };
}

function makeCombination(overrides: {
  visibility?: string;
  description?: string | null;
  layoutJson?: unknown;
} = {}) {
  return {
    visibility: overrides.visibility ?? "PUBLIC",
    description: overrides.description ?? makeDescription(),
    layoutJson: overrides.layoutJson ?? makeLayout(["tn", "c5n", "lnmas"]),
  };
}

describe("public combination SEO gate", () => {
  it("marks public combinations with enough original description and valid channels as indexable", () => {
    const result = analyzePublicCombinationSeo(makeCombination());

    expect(result.isIndexable).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(result.uniqueChannels.map((channel) => channel.id)).toEqual(["tn", "c5n", "lnmas"]);
    expect(result.categories.map((category) => category.slug)).toEqual(["noticias"]);
  });

  it("excludes private combinations", () => {
    const result = analyzePublicCombinationSeo(makeCombination({ visibility: "PRIVATE" }));

    expect(result.isIndexable).toBe(false);
    expect(result.reasons).toContain("not-public");
  });

  it("excludes public combinations with short or blank descriptions", () => {
    const shortDescription = "Muy corta";
    const blankDescription = " ".repeat(PUBLIC_COMBINATION_MIN_DESCRIPTION_LENGTH);

    expect(
      analyzePublicCombinationSeo(makeCombination({ description: shortDescription })).reasons,
    ).toContain("description-too-short");
    expect(
      analyzePublicCombinationSeo(makeCombination({ description: blankDescription })).reasons,
    ).toContain("description-too-short");
  });

  it("excludes invalid layouts", () => {
    const result = analyzePublicCombinationSeo(makeCombination({ layoutJson: "not-a-layout" }));

    expect(result.isIndexable).toBe(false);
    expect(result.layout).toBeNull();
    expect(result.reasons).toContain("invalid-layout");
  });

  it("excludes combinations with missing catalog channels", () => {
    const result = analyzePublicCombinationSeo(
      makeCombination({ layoutJson: makeLayout(["tn", "c5n", "missing-channel"]) }),
    );

    expect(result.isIndexable).toBe(false);
    expect(result.missingChannelIds).toEqual(["missing-channel"]);
    expect(result.reasons).toContain("missing-channels");
  });

  it("requires at least three unique catalog-backed channels", () => {
    const result = analyzePublicCombinationSeo(
      makeCombination({ layoutJson: makeLayout(["tn", "tn", "c5n"]) }),
    );

    expect(result.isIndexable).toBe(false);
    expect(result.uniqueChannels.map((channel) => channel.id)).toEqual(["tn", "c5n"]);
    expect(result.reasons).toContain("not-enough-unique-channels");
  });

  it("builds canonical public combination routes", () => {
    expect(getPublicCombinationRoute("mesa-de-noticias")).toBe("/combo/mesa-de-noticias");
  });
});
