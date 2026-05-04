# Live Metadata Observability

## Goal

Give operators the minimum context needed to diagnose failures on the live metadata and ticker paths in production without guessing.

## Runtime Configuration

| Route | Runtime | Max Duration | Rendering |
|-------|---------|-------------|-----------|
| `GET /api/live` | Node.js serverless | 15 seconds | force-dynamic |
| `GET /api/ticker` | Node.js serverless | 10 seconds | force-dynamic |

**Why Node.js (not edge):** `/api/live` calls `lib/youtube-quota.ts` which writes to the `quota_usage` Postgres table via Prisma. The Neon adapter requires Node.js APIs. Edge runtime is incompatible.

**Why 15 s for `/api/live`:** `getLiveSnapshots()` fetches up to three channel tiers concurrently from the YouTube Data API v3. Each tier makes one `search.list` call plus one `videos.list` call per channel. Network latency to the YouTube API can exceed 5 seconds under load.

**Why force-dynamic:** Both routes read request headers for IP-based rate limiting, which opts them out of static caching automatically. The export makes the intent explicit.

## Quota Health Signals

`/api/live` degrades gracefully before the YouTube Data API daily quota is exhausted:

- `lib/youtube.ts` calls `getQuotaStatus()` before each tier batch.
- When status is `exhausted`, channels return `isLive: false` without making YouTube API calls.
- When status is `warning`, channels are fetched normally but operators should monitor usage.

Quota state is persisted in the `quota_usage` Postgres table (one row per UTC calendar day).

**Operator query — current quota usage:**

```sql
SELECT date, units
FROM quota_usage
ORDER BY date DESC
LIMIT 5;
```

**Relevant environment variables (names only — values are private):**

| Variable | Default | Meaning |
|----------|---------|---------|
| `YOUTUBE_QUOTA_BUDGET` | 9000 | Hard daily limit; exhausted status triggers graceful degradation |
| `YOUTUBE_QUOTA_WARNING` | 7500 | Soft threshold; warning status logged but requests continue |

Both thresholds are operator-tunable via Vercel environment variables without a code change.

## Error Logging

Both routes emit structured `console.error` lines when the underlying service call throws. These lines appear in Vercel Function Logs under the `ERROR` level.

| Log prefix | Source | Likely cause |
|------------|--------|-------------|
| `[api/live] getLiveSnapshots failed` | `app/api/live/route.ts` | YouTube API error, quota exhaustion throwing unexpectedly, or Prisma connection failure |
| `[api/ticker] getTickerItems failed` | `app/api/ticker/route.ts` | RSS feed unreachable or malformed feed XML |

Both routes return `{ "error": "internal_error" }` with HTTP 500 when the underlying call throws. They never expose internal stack traces or service error details in the response body.

## Vercel Logs Diagnostic Playbook

### Step 1 — Check Vercel Function Logs

1. Open the Vercel dashboard for the project.
2. Navigate to **Logs** and filter by function path `/api/live` or `/api/ticker`.
3. Set log level to `ERROR` to surface failures first.
4. Search for `[api/live]` or `[api/ticker]` prefixes to find structured error lines.

### Step 2 — Identify the failure class

| Symptom | Likely cause | Next action |
|---------|-------------|-------------|
| `[api/live] getLiveSnapshots failed` + YouTube 403 | Quota exhausted or API key revoked | Check `quota_usage` table; verify `YOUTUBE_API_KEY` in Vercel env |
| `[api/live] getLiveSnapshots failed` + Prisma connection error | Neon database unavailable | Check Neon status; verify `DATABASE_URL` env |
| HTTP 429 on `/api/live` from repo | Client exceeded 30 req/min in-memory limit | Check WAF logs; IP may need blocking |
| HTTP 429 on `/api/live` from WAF | Client exceeded WAF rule threshold | See `docs/runbooks/waf-protection.md` |
| HTTP 429 on `/api/ticker` | Client exceeded 20 req/min limit | Same pattern as above |
| HTTP 500 with `internal_error` body | Unhandled throw in service layer | Inspect the full error in Vercel logs |

### Step 3 — Minimum dashboards to check

1. **Vercel → Functions tab** — filter by `/api/live` and `/api/ticker`; inspect invocation duration and error rate trends.
2. **Vercel → Logs tab** — filter `ERROR` level; search for `[api/live]` or `[api/ticker]`.
3. **Vercel → Firewall tab** — confirm WAF rules are `Enforced` and review rate-limit hit counts. See `docs/runbooks/waf-protection.md`.
4. **Neon dashboard** — check connection health if Prisma errors appear in logs.

## Responsibility Map

| Layer | What it covers | Where to look |
|-------|---------------|---------------|
| In-memory rate limiting (per instance) | Burst protection before service calls run | `lib/rate-limit.ts` |
| YouTube quota accounting | Daily unit tracking; graceful degradation | `lib/youtube-quota.ts`, `quota_usage` table |
| Quota-aware snapshot fetching | Tier-parallel fetching with exhaustion guard | `lib/youtube.ts` → `fetchSnapshotsForChannels` |
| Error logging | Structured `console.error` lines in Vercel logs | `app/api/live/route.ts`, `app/api/ticker/route.ts` |
| Platform WAF rate limiting | Edge-level enforcement surviving cold starts | Vercel Firewall — see `docs/runbooks/waf-protection.md` |
| Database health | Neon connection status | Neon dashboard + `docs/runbooks/neon-migration.md` |
| Production schema | Quota table migrations | `docs/runbooks/production-database-migrations.md` |
