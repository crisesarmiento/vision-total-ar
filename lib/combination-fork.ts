import type { Prisma } from "@prisma/client";

export const FORK_NAME_MAX_LENGTH = 60;
export const FORK_NAME_PREFIX = "Copia de ";

export type ForkSource = {
  id: string;
  name: string;
  description: string | null;
  layoutJson: Prisma.JsonValue;
};

export type ForkPayload = {
  ownerId: string;
  name: string;
  description: string | null;
  layoutJson: Prisma.InputJsonValue;
  visibility: "PRIVATE";
};

export function buildForkPayload(source: ForkSource, ownerId: string): ForkPayload {
  return {
    ownerId,
    name: forkedName(source.name),
    description: source.description ?? null,
    layoutJson: structuredClone(source.layoutJson) as Prisma.InputJsonValue,
    visibility: "PRIVATE",
  };
}

function forkedName(sourceName: string) {
  const prefixed = `${FORK_NAME_PREFIX}${sourceName}`;
  return prefixed.length <= FORK_NAME_MAX_LENGTH
    ? prefixed
    : prefixed.slice(0, FORK_NAME_MAX_LENGTH);
}
