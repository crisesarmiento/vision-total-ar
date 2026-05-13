import type { BeforeSendEvent } from "@vercel/analytics";

export const ENABLE_WEB_ANALYTICS =
  process.env.NEXT_PUBLIC_ENABLE_WEB_ANALYTICS === "true";

export const PROTECTED_ANALYTICS_ROUTE_PREFIXES = [
  "/perfil",
  "/configuracion",
  "/mis-combinaciones",
] as const;

export type SearchLandingSurface = "channels" | "category" | "channel" | "public_combo";
export type DashboardOpenSource = "direct" | "public_combo" | "shared_layout";
export type SignupMethod = "email" | "magic_link" | "google" | "unknown";
export type CountBucket = "0" | "1-2" | "3-4" | "5+";
export type FavoriteCountBucket = "0" | "1-9" | "10-49" | "50+";

export type AnalyticsEventPayloadMap = {
  search_landing_view: {
    surface: SearchLandingSurface;
  };
  dashboard_open: {
    source: DashboardOpenSource;
  };
  public_combo_open: {
    indexable: boolean;
    channel_count_bucket: CountBucket;
    missing_channel_count_bucket: CountBucket;
    favorite_count_bucket: FavoriteCountBucket;
  };
  signup_completed: {
    method: SignupMethod;
  };
  favorite_combo_toggled: {
    action: "favorite" | "unfavorite";
  };
  public_combo_forked: {
    result: "success";
  };
};

export type AnalyticsEventName = keyof AnalyticsEventPayloadMap;

export type AnalyticsEventInput = {
  [Name in AnalyticsEventName]: {
    name: Name;
    properties: AnalyticsEventPayloadMap[Name];
  };
}[AnalyticsEventName];

export type AnalyticsProperties =
  AnalyticsEventPayloadMap[AnalyticsEventName];

type SanitizedAnalyticsEvent = {
  name: AnalyticsEventName;
  properties: Record<string, string | number | boolean | null>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStringValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

export function bucketCount(value: number): CountBucket {
  if (value <= 0) return "0";
  if (value <= 2) return "1-2";
  if (value <= 4) return "3-4";
  return "5+";
}

export function bucketFavoriteCount(value: number): FavoriteCountBucket {
  if (value <= 0) return "0";
  if (value <= 9) return "1-9";
  if (value <= 49) return "10-49";
  return "50+";
}

export function sanitizeAnalyticsEvent(
  name: string,
  properties: unknown,
): SanitizedAnalyticsEvent | null {
  if (!isRecord(properties)) {
    return null;
  }

  switch (name) {
    case "search_landing_view": {
      if (
        !hasStringValue(properties.surface, [
          "channels",
          "category",
          "channel",
          "public_combo",
        ] as const)
      ) {
        return null;
      }

      return {
        name,
        properties: {
          surface: properties.surface,
        },
      };
    }
    case "dashboard_open": {
      if (
        !hasStringValue(properties.source, [
          "direct",
          "public_combo",
          "shared_layout",
        ] as const)
      ) {
        return null;
      }

      return {
        name,
        properties: {
          source: properties.source,
        },
      };
    }
    case "public_combo_open": {
      if (
        typeof properties.indexable !== "boolean" ||
        !hasStringValue(properties.channel_count_bucket, [
          "0",
          "1-2",
          "3-4",
          "5+",
        ] as const) ||
        !hasStringValue(properties.missing_channel_count_bucket, [
          "0",
          "1-2",
          "3-4",
          "5+",
        ] as const) ||
        !hasStringValue(properties.favorite_count_bucket, [
          "0",
          "1-9",
          "10-49",
          "50+",
        ] as const)
      ) {
        return null;
      }

      return {
        name,
        properties: {
          indexable: properties.indexable,
          channel_count_bucket: properties.channel_count_bucket,
          missing_channel_count_bucket: properties.missing_channel_count_bucket,
          favorite_count_bucket: properties.favorite_count_bucket,
        },
      };
    }
    case "signup_completed": {
      if (
        !hasStringValue(properties.method, [
          "email",
          "magic_link",
          "google",
          "unknown",
        ] as const)
      ) {
        return null;
      }

      return {
        name,
        properties: {
          method: properties.method,
        },
      };
    }
    case "favorite_combo_toggled": {
      if (
        !hasStringValue(properties.action, ["favorite", "unfavorite"] as const)
      ) {
        return null;
      }

      return {
        name,
        properties: {
          action: properties.action,
        },
      };
    }
    case "public_combo_forked": {
      if (!hasStringValue(properties.result, ["success"] as const)) {
        return null;
      }

      return {
        name,
        properties: {
          result: properties.result,
        },
      };
    }
    default:
      return null;
  }
}

function getPathnameFromAnalyticsUrl(url: string) {
  try {
    return new URL(url, "https://vision.local").pathname;
  } catch {
    return null;
  }
}

export function sanitizeAnalyticsUrl(url: string) {
  try {
    const parsed = new URL(url, "https://vision.local");

    if (
      PROTECTED_ANALYTICS_ROUTE_PREFIXES.some(
        (prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`),
      )
    ) {
      return null;
    }

    if (url.startsWith("/")) {
      return parsed.pathname;
    }

    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return null;
  }
}

export function beforeSendAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  const sanitizedUrl = sanitizeAnalyticsUrl(event.url);

  if (!sanitizedUrl) {
    return null;
  }

  return {
    ...event,
    url: sanitizedUrl,
  };
}

export function getDashboardOpenSource(input: {
  combo?: string;
  layout?: string;
}): DashboardOpenSource {
  if (input.combo) return "public_combo";
  if (input.layout) return "shared_layout";
  return "direct";
}

export function getSignupMethodFromAuthContext(context: unknown): SignupMethod {
  if (!isRecord(context)) {
    return "unknown";
  }

  const path = typeof context.path === "string" ? context.path : "";
  const pathname = getPathnameFromAnalyticsUrl(path) ?? path;

  if (pathname.includes("/sign-up/email")) return "email";
  if (pathname.includes("/callback/google") || pathname.includes("/sign-in/social")) {
    return "google";
  }
  if (pathname.includes("/magic-link")) return "magic_link";

  return "unknown";
}
