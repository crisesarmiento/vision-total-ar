import { z } from "zod";
import { isLayoutPresetId, type LayoutPresetId } from "@/lib/layout-presets";

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

export function parseDashboardLayout(value: unknown): DashboardLayout | null {
  const result = dashboardLayoutSchema.safeParse(value);
  return result.success ? result.data : null;
}
