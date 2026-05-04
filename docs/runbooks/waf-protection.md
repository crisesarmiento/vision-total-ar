# Vercel WAF Protection

## Goal

Document the expected Vercel WAF configuration for Vision AR public endpoints, how to verify WAF behavior, and the rollback path.

Private dashboard URLs, account-specific paths, WAF rule IDs, and credentials are never committed to this repository.

Reference: [Vercel WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)

## Protected Endpoints

Configure WAF rate limiting rules for the following paths, aligned with the in-memory limits in `docs/runbooks/rate-limiting.md`:

| Endpoint | Method | Recommended limit | Window | Key |
|----------|--------|------------------|--------|-----|
| `/api/live` | GET | 30 requests | 60 seconds | IP |
| `/api/ticker` | GET | 20 requests | 60 seconds | IP |
| `/api/auth/*` | GET | 120 requests | 60 seconds | IP |
| `/api/auth/*` | POST | 30 requests | 60 seconds | IP |

Use IP as the primary key. Where the Vercel plan supports it, JA4 digest keying provides better protection against IP spoofing.

These WAF rules complement the repo-side in-memory limits. They survive serverless cold starts and multi-instance scale-out; the in-memory limits do not. Both layers are expected to be active in production.

## Deployment Sequence

1. **Create rules in Log mode** to observe real traffic without blocking any requests.
2. **Watch the WAF log** for at least one traffic cycle (typically 24–48 hours for Vision AR's dashboard polling cadence).
3. **Verify no false positives** — normal dashboard clients poll `/api/live` once per minute and `/api/ticker` once every 5 minutes per tab, well below any configured limit.
4. **Switch to Enforce mode** once the limits look safe and no legitimate clients are being flagged.

## Recording WAF Status in Linear

Record the current WAF state in [CRIS-265](https://linear.app/cris-emi/issue/CRIS-265) using public-safe wording only. Examples:

- "WAF rules created for `/api/live`, `/api/ticker`, `/api/auth/*` — currently in Log mode, observing traffic."
- "WAF rules switched to Enforce mode — no false positives observed during observation period."
- "WAF rules disabled pending review — traffic spike caused false positives on `/api/live`."

Do not include dashboard URLs, rule IDs, account paths, or traffic volume numbers that could help an attacker tune a bypass.

## Verification

After configuring WAF rules, verify endpoint availability from a terminal:

```bash
# Spot check — expect 200
curl -I https://vision-total-ar.vercel.app/api/live
curl -I https://vision-total-ar.vercel.app/api/ticker

# Burst test — expect 429 near or after the configured threshold
# (adjust COUNT to match the rule limit + a few extra)
COUNT=35
for i in $(seq 1 $COUNT); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    https://vision-total-ar.vercel.app/api/live
done
```

### Distinguishing WAF 429 from repo-side 429

Both layers return HTTP 429, but the headers differ:

| Header | WAF 429 | Repo-side 429 |
|--------|---------|--------------|
| `Retry-After` | May be present (Vercel behavior) | Always present |
| `X-RateLimit-Limit` | Not present | Present |
| `X-RateLimit-Remaining` | Not present | Present |
| `X-RateLimit-Reset` | Not present | Present |
| `x-vercel-waf-rule` | Present (when Vercel includes it) | Not present |

A 429 with no `X-RateLimit-*` headers is a WAF-level block. A 429 with `X-RateLimit-Limit` is from `lib/rate-limit.ts`.

## Rollback

If a WAF rule blocks legitimate traffic:

1. Open the Vercel Firewall dashboard for the project.
2. Switch the offending rule back to **Log mode**, or disable it entirely.
3. Changes take effect within seconds — no deployment is required.
4. Update the Linear ticket CRIS-265 with a public-safe status note.
5. Investigate the false-positive pattern before re-enabling the rule.

## Scope

This runbook covers Vercel WAF rate limiting for public API routes only. It does not cover:

- Bot detection or challenge rules (configured separately in the Vercel Firewall dashboard)
- IP allowlists or blocklists
- Private maintainer WAF operational steps

For repo-side in-memory rate limits, see `docs/runbooks/rate-limiting.md`.
For live metadata route observability and quota health, see `docs/runbooks/live-metadata-observability.md`.
