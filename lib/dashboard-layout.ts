import { z } from "zod";
import { getChannelById } from "@/lib/channels";
import {
  getPresetById,
  isLayoutPresetId,
  type LayoutPresetId,
} from "@/lib/layout-presets";

export const playerTileSchema = z.object({
  slotId: z.string().min(1),
  channelId: z.string().min(1),
  muted: z.boolean(),
  volume: z.number().finite().min(0).max(100),
});

export const dashboardLayoutSchema = z.object({
  preset: z.custom<LayoutPresetId>(isLayoutPresetId),
  players: z.array(playerTileSchema),
});

export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;
export type DashboardPlayerTile = z.infer<typeof playerTileSchema>;

export const MAX_SHARED_LAYOUT_PARAM_LENGTH = 8_000;

export function parseDashboardLayout(value: unknown): DashboardLayout | null {
  const result = dashboardLayoutSchema.safeParse(value);
  return result.success ? result.data : null;
}

function parseMaybeEncodedJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return JSON.parse(decodeURIComponent(value)) as unknown;
  }
}

export function normalizeSharedDashboardLayout(
  value: unknown,
): DashboardLayout | null {
  const layout = parseDashboardLayout(value);

  if (!layout) {
    return null;
  }

  const maxPlayers = getPresetById(layout.preset).maxPlayers;
  const players = layout.players.slice(0, maxPlayers);

  if (players.some((player) => !getChannelById(player.channelId))) {
    return null;
  }

  return {
    preset: layout.preset,
    players,
  };
}

export function encodeDashboardLayoutShareParam(layout: DashboardLayout) {
  const normalizedLayout = normalizeSharedDashboardLayout(layout);

  if (!normalizedLayout) {
    throw new Error("Invalid dashboard layout");
  }

  const encodedLayout = encodeURIComponent(JSON.stringify(normalizedLayout));

  if (encodedLayout.length > MAX_SHARED_LAYOUT_PARAM_LENGTH) {
    throw new Error("Shared dashboard layout is too large");
  }

  return encodedLayout;
}

export function decodeDashboardLayoutShareParam(
  value: string | null | undefined,
): DashboardLayout | null {
  if (!value || value.length > MAX_SHARED_LAYOUT_PARAM_LENGTH) {
    return null;
  }

  try {
    return normalizeSharedDashboardLayout(parseMaybeEncodedJson(value));
  } catch {
    return null;
  }
}

export function serializeDashboardLayout(layout: DashboardLayout) {
  return JSON.stringify(normalizeSharedDashboardLayout(layout));
}
