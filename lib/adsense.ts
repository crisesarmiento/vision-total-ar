const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{16,20}$/;

export type AdSenseConfig = {
  enabled: boolean;
  clientId: string | null;
  adsTxtPublisherId: string | null;
};

type AdSenseEnv = Record<string, string | undefined>;

function normalizeValue(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function isValidAdSenseClientId(value: string | null) {
  return Boolean(value && ADSENSE_CLIENT_ID_PATTERN.test(value));
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
