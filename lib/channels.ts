export type ChannelCategory = "noticias" | "streaming" | "tv";

/**
 * Refresh tier controls how frequently the live snapshot for a channel is
 * revalidated from the YouTube Data API.
 *
 *  Tier 1 — 60 s   (top editorial channels; highest refresh priority)
 *  Tier 2 — 120 s  (secondary channels; moderate refresh frequency)
 *  Tier 3 — 300 s  (streaming / independent / lower-traffic channels)
 *
 * Quota cost per refresh cycle per channel: ~100 units (search.list) +
 * 1 unit (videos.list, only when live). Tier 3 channels therefore consume
 * ~5× fewer quota units per day than Tier 1 channels.
 */
export type RefreshTier = 1 | 2 | 3;

export type NewsChannel = {
  id: string;
  name: string;
  shortName: string;
  channelId: string;
  liveUrl: string;
  category: ChannelCategory;
  accent: string;
  description: string;
  isIndependent?: boolean;
  refreshTier: RefreshTier;
};

const createLiveUrl = (channelId: string) =>
  `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=0&mute=1&controls=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  )}`;

export const channels: NewsChannel[] = [
  // --- Tier 1 (60 s refresh) — top editorial channels; matches DEFAULT_CHANNEL_IDS ---
  {
    id: "tn",
    name: "TN - Todo Noticias",
    shortName: "TN",
    channelId: "UCj6PcyLvpnIRT_2W_mwa9Aw",
    liveUrl: createLiveUrl("UCj6PcyLvpnIRT_2W_mwa9Aw"),
    category: "noticias",
    accent: "#2563eb",
    description: "Cobertura 24/7 de actualidad, política y economía.",
    refreshTier: 1,
  },
  {
    id: "c5n",
    name: "C5N",
    shortName: "C5N",
    channelId: "UCFgk2Q2mVO1BklRQhSv6p0w",
    liveUrl: createLiveUrl("UCFgk2Q2mVO1BklRQhSv6p0w"),
    category: "noticias",
    accent: "#ef4444",
    description: "Noticias en vivo, móviles y programación política.",
    refreshTier: 1,
  },
  {
    id: "lnmas",
    name: "LN+",
    shortName: "LN+",
    channelId: "UCba3hpU7EFBSk817y9qZkiA",
    liveUrl: createLiveUrl("UCba3hpU7EFBSk817y9qZkiA"),
    category: "noticias",
    accent: "#38bdf8",
    description: "Cobertura periodística en vivo desde la redacción de La Nación.",
    refreshTier: 1,
  },
  {
    id: "a24",
    name: "A24",
    shortName: "A24",
    channelId: "UCR9120YBAqMfntqgRTKmkjQ",
    liveUrl: createLiveUrl("UCR9120YBAqMfntqgRTKmkjQ"),
    category: "noticias",
    accent: "#f97316",
    description: "Actualidad, análisis y debates en vivo.",
    refreshTier: 1,
  },
  // --- Tier 2 (120 s refresh) — secondary news and broad-reach TV channels ---
  {
    id: "canal26",
    name: "Canal 26",
    shortName: "Canal 26",
    channelId: "UCrpMfcQNog595v5gAS-oUsQ",
    liveUrl: createLiveUrl("UCrpMfcQNog595v5gAS-oUsQ"),
    category: "noticias",
    accent: "#22c55e",
    description: "Cobertura de noticias, mercados y actualidad internacional.",
    refreshTier: 2,
  },
  {
    id: "cronica",
    name: "Crónica TV",
    shortName: "Crónica",
    channelId: "UCT7KFGv6s2a-rh2Jq8ZdM1g",
    liveUrl: createLiveUrl("UCT7KFGv6s2a-rh2Jq8ZdM1g"),
    category: "noticias",
    accent: "#dc2626",
    description: "Último momento, policiales y móviles de alto impacto.",
    refreshTier: 2,
  },
  {
    id: "america",
    name: "América TV",
    shortName: "América",
    channelId: "UC9J7mCrq6h8BWW9Gs1lTgkg",
    liveUrl: createLiveUrl("UC9J7mCrq6h8BWW9Gs1lTgkg"),
    category: "tv",
    accent: "#fb7185",
    description: "Señal generalista con momentos de actualidad en vivo.",
    refreshTier: 2,
  },
  {
    id: "telefe",
    name: "Telefe Noticias",
    shortName: "Telefe",
    channelId: "UC9rmiEjzbP_WsyM_yfW5R4w",
    liveUrl: createLiveUrl("UC9rmiEjzbP_WsyM_yfW5R4w"),
    category: "tv",
    accent: "#60a5fa",
    description: "Marca generalista con alto alcance y cobertura especial.",
    refreshTier: 2,
  },
  {
    id: "tvpublica",
    name: "TV Pública",
    shortName: "TV Pública",
    channelId: "UCgCyHQGAqwB1sAEqEDngEEg",
    liveUrl: createLiveUrl("UCgCyHQGAqwB1sAEqEDngEEg"),
    category: "tv",
    accent: "#16a34a",
    description: "Canal estatal de aire con cobertura nacional.",
    refreshTier: 2,
  },
  // --- Tier 3 (300 s refresh) — streaming/independent/lower-traffic channels ---
  {
    id: "luzu",
    name: "Luzu TV",
    shortName: "Luzu",
    channelId: "UCq4f6u2z8z3eY5fL9pKzqQw",
    liveUrl: createLiveUrl("UCq4f6u2z8z3eY5fL9pKzqQw"),
    category: "streaming",
    accent: "#facc15",
    description: "Streaming en vivo con conversación social, cultura y política.",
    isIndependent: true,
    refreshTier: 3,
  },
  {
    id: "olga",
    name: "OLGA",
    shortName: "OLGA",
    channelId: "UCNPTsFZxBqxf8wzR8f7J0Xw",
    liveUrl: createLiveUrl("UCNPTsFZxBqxf8wzR8f7J0Xw"),
    category: "streaming",
    accent: "#a855f7",
    description: "Streaming en vivo con agenda propia y enfoque cultural.",
    isIndependent: true,
    refreshTier: 3,
  },
  {
    id: "bondi",
    name: "Bondi Live",
    shortName: "Bondi",
    channelId: "UCQYw7xk8r0N7M3nXx0eJ8hA",
    liveUrl: createLiveUrl("UCQYw7xk8r0N7M3nXx0eJ8hA"),
    category: "streaming",
    accent: "#14b8a6",
    description: "Señal digital para sumar miradas y streamers argentinos.",
    isIndependent: true,
    refreshTier: 3,
  },
  {
    id: "ip",
    name: "IP Noticias",
    shortName: "IP",
    channelId: "UCtQ6k7S4FhM3o1L2Qp5w6xA",
    liveUrl: createLiveUrl("UCtQ6k7S4FhM3o1L2Qp5w6xA"),
    category: "noticias",
    accent: "#e11d48",
    description: "Noticias en vivo con foco en agenda nacional y federal.",
    refreshTier: 3,
  },
  {
    id: "cn23",
    name: "CN23",
    shortName: "CN23",
    channelId: "UCbOPRkNBnhKH7xnWGpekA0g",
    liveUrl: createLiveUrl("UCbOPRkNBnhKH7xnWGpekA0g"),
    category: "noticias",
    accent: "#0891b2",
    description: "Señal de noticias con perspectiva federal y social.",
    refreshTier: 3,
  },
  {
    id: "blender",
    name: "Blender",
    shortName: "Blender",
    channelId: "UC5Xt4A1h6p9cqCpz0XUBkQA",
    liveUrl: createLiveUrl("UC5Xt4A1h6p9cqCpz0XUBkQA"),
    category: "streaming",
    accent: "#7c3aed",
    description: "Streaming independiente con debates y periodismo de investigación.",
    isIndependent: true,
    refreshTier: 3,
  },
  {
    id: "canal-ciudad",
    name: "Canal de la Ciudad",
    shortName: "Ciudad",
    channelId: "UCd3S_zFIaxJBJJ4X7DvuHPw",
    liveUrl: createLiveUrl("UCd3S_zFIaxJBJJ4X7DvuHPw"),
    category: "tv",
    accent: "#f59e0b",
    description: "Canal de la Ciudad Autónoma de Buenos Aires.",
    refreshTier: 3,
  },
];

export const DEFAULT_CHANNEL_IDS = ["tn", "c5n", "lnmas", "a24"];

export function getChannelById(id: string) {
  return channels.find((channel) => channel.id === id);
}
