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

## Vercel WAF Operational Note

For production, configure Vercel WAF Rate Limiting for these paths:

- `/api/auth/*`
- `/api/live`
- `/api/ticker`

Use fixed-window limits aligned with the repo-side defaults, keyed by IP or JA4 digest where available. Start in `Log` mode if production traffic needs observation, then publish the rule with the default `429` action once the limits look safe.

Reference: [Vercel WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

Do not document private dashboard URLs, account paths, or credential values in this repository.
