export type LayoutPresetId =
  | "1x1"
  | "2x1"
  | "2x2"
  | "3x3"
  | "4x4"
  | "custom";

export type StoredGridPreset =
  | "GRID_1"
  | "GRID_2X1"
  | "GRID_2X2"
  | "GRID_3X3"
  | "GRID_4X4"
  | "CUSTOM";

export type GridPreset = {
  id: LayoutPresetId;
  name: string;
  description: string;
  columns: number;
  rows: number;
  maxPlayers: number;
};

export const GRID_PRESETS: GridPreset[] = [
  {
    id: "1x1",
    name: "1 x 1",
    description: "Modo foco para una sola señal.",
    columns: 1,
    rows: 1,
    maxPlayers: 1,
  },
  {
    id: "2x1",
    name: "2 x 1",
    description: "Dos señales en horizontal.",
    columns: 2,
    rows: 1,
    maxPlayers: 2,
  },
  {
    id: "2x2",
    name: "2 x 2",
    description: "La grilla recomendada para seguir cuatro pantallas.",
    columns: 2,
    rows: 2,
    maxPlayers: 4,
  },
  {
    id: "3x3",
    name: "3 x 3",
    description: "Cobertura intensiva de nueve señales.",
    columns: 3,
    rows: 3,
    maxPlayers: 9,
  },
  {
    id: "4x4",
    name: "4 x 4",
    description: "Modo central de monitoreo para hasta doce señales.",
    columns: 4,
    rows: 4,
    maxPlayers: 12,
  },
];

const STORED_GRID_PRESET_BY_LAYOUT: Record<LayoutPresetId, StoredGridPreset> = {
  "1x1": "GRID_1",
  "2x1": "GRID_2X1",
  "2x2": "GRID_2X2",
  "3x3": "GRID_3X3",
  "4x4": "GRID_4X4",
  custom: "CUSTOM",
};

const LAYOUT_PRESET_BY_STORED_GRID: Record<StoredGridPreset, LayoutPresetId> = {
  GRID_1: "1x1",
  GRID_2X1: "2x1",
  GRID_2X2: "2x2",
  GRID_3X3: "3x3",
  GRID_4X4: "4x4",
  CUSTOM: "custom",
};

export function isLayoutPresetId(value: unknown): value is LayoutPresetId {
  return GRID_PRESETS.some((preset) => preset.id === value) || value === "custom";
}

export function getPresetById(id: LayoutPresetId) {
  return GRID_PRESETS.find((preset) => preset.id === id) ?? GRID_PRESETS[2];
}

export function toStoredGridPreset(id: LayoutPresetId): StoredGridPreset {
  return STORED_GRID_PRESET_BY_LAYOUT[id];
}

export function fromStoredGridPreset(
  value: StoredGridPreset | null | undefined,
): LayoutPresetId {
  return value ? LAYOUT_PRESET_BY_STORED_GRID[value] : "2x2";
}
