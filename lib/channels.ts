export type ChannelCategory = "noticias" | "streaming" | "tv";

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
};

const createLiveUrl = (channelId: string) =>
  `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=0&mute=1&controls=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  )}`;

export const channels: NewsChannel[] = [
  {
    id: "tn",
    name: "TN - Todo Noticias",
    shortName: "TN",
    channelId: "UCj6PcyLvpnIRT_2W_mwa9Aw",
    liveUrl: createLiveUrl("UCj6PcyLvpnIRT_2W_mwa9Aw"),
    category: "noticias",
    accent: "#2563eb",
    description: "Cobertura 24/7 de actualidad, política y economía.",
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
  },
  {
    id: "canal26",
    name: "Canal 26",
    shortName: "Canal 26",
    channelId: "UCrpMfcQNog595v5gAS-oUsQ",
    liveUrl: createLiveUrl("UCrpMfcQNog595v5gAS-oUsQ"),
    category: "noticias",
    accent: "#22c55e",
    description: "Cobertura de noticias, mercados y actualidad internacional.",
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
  },
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
  },
];

export const DEFAULT_CHANNEL_IDS = ["tn", "c5n", "lnmas", "a24"];

export function getChannelById(id: string) {
  return channels.find((channel) => channel.id === id);
}
