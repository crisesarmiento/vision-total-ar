# Rate Limiting

Vision AR uses repo-visible rate limits for the easiest endpoints to hammer and relies on Vercel Firewall/WAF for stronger production edge enforcement.

## Repo-Side Limits

The app applies fixed-window in-memory limits before expensive endpoint work runs:

| Endpoint | Limit | Window | Key |
| --- | ---: | ---: | --- |
| `GET /api/live` | 30 requests | 60 seconds | client IP |
| `GET /api/ticker` | 20 requests | 60 seconds | client IP |
| `GET /api/auth/*` | 120 requests | 60 seconds | client IP |
| `POST /api/auth/*` | 30 requests | 60 seconds | client IP |
| Auth email attempts | 10 requests | 10 minutes | normalized email |
| Auth magic-link email attempts | 5 requests | 10 minutes | normalized email |

When a request is throttled, the API returns `429` with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`.

These limits are intentionally conservative. Normal dashboard polling is currently one `/api/live` request every 60 seconds and one `/api/ticker` request every 300 seconds per tab.

## Runtime Behavior

The repo-side limiter is an in-memory baseline:

- Buckets are per runtime instance.
- Buckets reset on cold starts or deployments.
- Serverless scale-out can create separate buckets per instance.

This is enough to catch obvious bursts in local, preview, and many production cases. It is not a replacement for platform-level production controls.

## Vercel WAF

For production WAF configuration, deployment sequence, verification commands, and rollback guidance, see [`docs/runbooks/waf-protection.md`](./waf-protection.md).

The WAF layer complements these in-memory limits by surviving cold starts and multi-instance scale-out. Both layers are expected to be active in production.
