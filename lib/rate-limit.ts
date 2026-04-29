import { NextResponse } from "next/server";

export type RateLimitPolicy = {
  id: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  key: string;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function normalizeRateLimitKey(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized || "unknown";
}

export function getClientRateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedClient = forwardedFor?.split(",")[0]?.trim();

  return normalizeRateLimitKey(
    forwardedClient ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-vercel-forwarded-for"),
  );
}

export function checkRateLimit(
  policy: RateLimitPolicy,
  key: string,
  now = Date.now(),
): RateLimitResult {
  cleanupExpiredBuckets(now);

  const bucketKey = `${policy.id}:${normalizeRateLimitKey(key)}`;
  const existing = buckets.get(bucketKey);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : {
          count: 0,
          resetAt: now + policy.windowMs,
        };

  bucket.count += 1;
  buckets.set(bucketKey, bucket);

  const remaining = Math.max(policy.limit - bucket.count, 0);
  const retryAfter = Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1);

  return {
    allowed: bucket.count <= policy.limit,
    key: bucketKey,
    limit: policy.limit,
    remaining,
    resetAt: bucket.resetAt,
    retryAfter,
  };
}

export function checkRequestRateLimit(request: Request, policy: RateLimitPolicy) {
  return checkRateLimit(policy, getClientRateLimitKey(request));
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    {
      error: "rate_limited",
      message: "Too many requests. Try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

export function clearRateLimitBuckets() {
  buckets.clear();
}

function cleanupExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
