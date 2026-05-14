const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{16,20}$/;
const ADSENSE_SLOT_ID_PATTERN = /^\d+$/;

export type AdSensePlacementSurface =
  | "channels-index"
  | "channel-category"
  | "channel-detail"
  | "public-combo";

export const ADSENSE_SLOT_ENV_BY_SURFACE: Record<AdSensePlacementSurface, string> = {
  "channels-index": "NEXT_PUBLIC_ADSENSE_SLOT_CHANNELS_INDEX",
  "channel-category": "NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_CATEGORY",
  "channel-detail": "NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_DETAIL",
  "public-combo": "NEXT_PUBLIC_ADSENSE_SLOT_PUBLIC_COMBO",
};

export type AdSenseConfig = {
  enabled: boolean;
  clientId: string | null;
  adsTxtPublisherId: string | null;
};

export type AdSensePlacementConfig = {
  enabled: boolean;
  clientId: string | null;
  slotId: string | null;
  surface: AdSensePlacementSurface;
};

type AdSenseEnv = Record<string, string | undefined>;

function normalizeValue(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function isValidAdSenseClientId(value: string | null) {
  return Boolean(value && ADSENSE_CLIENT_ID_PATTERN.test(value));
}

export function isValidAdSenseSlotId(value: string | null) {
  return Boolean(value && ADSENSE_SLOT_ID_PATTERN.test(value));
}

export function getAdsTxtPublisherId(clientId: string | null) {
  if (!clientId || !isValidAdSenseClientId(clientId)) {
    return null;
  }

  return clientId.replace(/^ca-/, "");
}

export function createAdSenseConfig(
  env: AdSenseEnv,
  nodeEnv = process.env.NODE_ENV,
): AdSenseConfig {
  const clientId = normalizeValue(env.NEXT_PUBLIC_ADSENSE_CLIENT_ID);
  const explicitEnable = env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
  const forceDisabled = env.ADSENSE_DISABLED === "true";
  const production = nodeEnv === "production";
  const enabled =
    production &&
    explicitEnable &&
    !forceDisabled &&
    isValidAdSenseClientId(clientId);
  const enabledClientId = enabled ? clientId : null;

  return {
    enabled,
    clientId: enabledClientId,
    adsTxtPublisherId: enabledClientId ? getAdsTxtPublisherId(enabledClientId) : null,
  };
}

export function getAdSenseConfig() {
  return createAdSenseConfig(process.env);
}

export function createAdSensePlacementConfig(
  surface: AdSensePlacementSurface,
  env: AdSenseEnv,
  nodeEnv = process.env.NODE_ENV,
): AdSensePlacementConfig {
  const config = createAdSenseConfig(env, nodeEnv);
  const slotEnvName = ADSENSE_SLOT_ENV_BY_SURFACE[surface];
  const slotId = normalizeValue(env[slotEnvName]);
  const enabled = config.enabled && isValidAdSenseSlotId(slotId);

  return {
    enabled,
    clientId: enabled ? config.clientId : null,
    slotId: enabled ? slotId : null,
    surface,
  };
}

export function getAdSensePlacementConfig(surface: AdSensePlacementSurface) {
  return createAdSensePlacementConfig(surface, process.env);
}
