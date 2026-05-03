import { describe, expect, it } from "vitest";
import { buildForkPayload, FORK_NAME_MAX_LENGTH } from "./combination-fork";

const baseSource = {
  id: "src-1",
  name: "Mesa de noticias",
  description: "Cuatro señales en vivo",
  layoutJson: {
    preset: "2x2",
    players: [
      { slotId: "slot-1", channelId: "tn" },
      { slotId: "slot-2", channelId: "c5n" },
    ],
  },
};

describe("buildForkPayload", () => {
  it("creates a private payload owned by the current user", () => {
    const payload = buildForkPayload(baseSource, "user-42");

    expect(payload.ownerId).toBe("user-42");
    expect(payload.visibility).toBe("PRIVATE");
  });

  it("prefixes the name with 'Copia de' so it is distinguishable in the library", () => {
    const payload = buildForkPayload(baseSource, "user-42");

    expect(payload.name).toBe("Copia de Mesa de noticias");
  });

  it("truncates the forked name to the schema limit", () => {
    const longName = "x".repeat(FORK_NAME_MAX_LENGTH + 20);
    const payload = buildForkPayload({ ...baseSource, name: longName }, "user-42");

    expect(payload.name.length).toBe(FORK_NAME_MAX_LENGTH);
    expect(payload.name.startsWith("Copia de ")).toBe(true);
  });

  it("preserves the source description and layout snapshot", () => {
    const payload = buildForkPayload(baseSource, "user-42");

    expect(payload.description).toBe(baseSource.description);
    expect(payload.layoutJson).toEqual(baseSource.layoutJson);
  });

  it("deep-clones layoutJson so later edits do not mutate the source", () => {
    const payload = buildForkPayload(baseSource, "user-42");

    (payload.layoutJson as { players: { slotId: string }[] }).players[0].slotId = "mutated";

    expect(
      (baseSource.layoutJson as { players: { slotId: string }[] }).players[0].slotId,
    ).toBe("slot-1");
  });

  it("normalizes a missing description to null", () => {
    const payload = buildForkPayload({ ...baseSource, description: null }, "user-42");

    expect(payload.description).toBeNull();
  });
});
