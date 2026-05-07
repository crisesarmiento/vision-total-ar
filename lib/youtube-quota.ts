/**
 * YouTube Data API v3 quota tracking.
 *
 * Tracks estimated unit consumption per UTC calendar day in the database so
 * that callers can degrade gracefully before the daily budget is exhausted.
 * All thresholds are configurable via environment variables — no code change
 * needed to tune them.
 *
 * Environment variables:
 *   YOUTUBE_QUOTA_BUDGET  — daily hard limit (units). When total spend
 *                           reaches this value the snapshot fetcher returns
 *                           safe not-live snapshots instead of hitting the
 *                           API. Default: 9000
 *   YOUTUBE_QUOTA_WARNING — soft warning threshold (units). When spend
 *                           crosses this value `nearWarning` is true in
 *                           getQuotaStatus() but fetching continues.
 *                           Default: 7500
 *
 * YouTube Data API v3 unit costs (approximate):
 *   search.list  → 100 units per call
 *   videos.list  →   1 unit  per call
 */

import { prisma } from "@/lib/prisma";

/** Unit cost for a search.list API call. */
export const SEARCH_COST = 100;

/** Unit cost for a videos.list API call. */
export const VIDEOS_COST = 1;

/** Returns today's date as a YYYY-MM-DD string in UTC. */
export function getTodayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function getBudget(): number {
  return parseInt(process.env.YOUTUBE_QUOTA_BUDGET ?? "9000", 10);
}

function getWarning(): number {
  return parseInt(process.env.YOUTUBE_QUOTA_WARNING ?? "7500", 10);
}

export type QuotaStatus = {
  used: number;
  budget: number;
  warning: number;
  /** True when used >= budget. Snapshot fetchers should skip API calls. */
  exhausted: boolean;
  /** True when used >= warning but below budget. Log or alert as needed. */
  nearWarning: boolean;
};

/**
 * Returns the current quota status for today (UTC).
 * Reading is a single indexed lookup; this is safe to call on every cache
 * refresh cycle.
 */
export async function getQuotaStatus(): Promise<QuotaStatus> {
  const date = getTodayUtc();
  const budget = getBudget();
  const warning = getWarning();

  const row = await prisma.quotaUsage.findUnique({ where: { date } });
  const used = row?.units ?? 0;

  return {
    used,
    budget,
    warning,
    exhausted: used >= budget,
    nearWarning: used >= warning,
  };
}

/**
 * Atomically increments the quota usage counter for today (UTC).
 *
 * Uses an upsert so the first call of the day creates the row and subsequent
 * calls increment it. The increment is fire-and-forget from the caller's
 * perspective — awaiting it is recommended for accuracy but not strictly
 * required for request path performance.
 */
export async function incrementQuota(units: number): Promise<void> {
  const date = getTodayUtc();

  await prisma.$executeRaw`
    INSERT INTO quota_usage (id, date, units, "updatedAt")
    VALUES (gen_random_uuid()::text, ${date}, ${units}, now())
    ON CONFLICT (date)
    DO UPDATE SET units = quota_usage.units + ${units}, "updatedAt" = now()
  `;
}
