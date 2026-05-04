# Public API Audit

This document classifies every API route, UploadThing handler, and server action
in Vision AR and identifies their current abuse controls. It is a living document —
update it whenever a new surface is added or an existing one changes.

**Last reviewed:** 2026-05-03  
**Reviewed against:** `develop` branch (post CRIS-232, CRIS-237, CRIS-265)

Private production data, dashboard URLs, WAF rule IDs, credentials, and incident
details are never committed to this repository. Follow-up tickets are linked from
this doc; full operational details live in private maintainer systems.

---

## Surface Classification Key

| Class | Meaning |
|-------|---------|
| **public** | Accessible without a session; intentionally open |
| **authenticated** | Requires a valid session; unauthenticated callers are rejected |
| **third-party callback** | Called by an external service (UploadThing, etc.); validated by SDK signature |
| **internal app action** | Next.js Server Action; requires session via `requireSession()` |

---

## API Routes — `app/api/*`

| Route | Methods | Class | Auth check | Rate limit | Input validation | Cache policy | Response shape | Observability | Gaps / follow-up |
|-------|---------|-------|-----------|-----------|-----------------|-------------|---------------|---------------|-----------------|
| `/api/live` | GET | public | None (intentional) | ✅ 30 req/60 s per IP (`api-live`) | None (no user input) | `force-dynamic` | `{ [channelId]: LiveSnapshot }` \| `{ error }` | `console.error` on 500 | None identified |
| `/api/ticker` | GET | public | None (intentional) | ✅ 20 req/60 s per IP (`api-ticker`) | None (no user input) | `force-dynamic` | `TickerItem[]` \| `{ error }` | `console.error` on 500 | None identified |
| `/api/auth/[...all]` | GET | public | Handled by Better Auth | ✅ 120 req/60 s per IP (`auth-get`) | Handled by Better Auth | N/A (auth tokens) | Handled by Better Auth | None (delegated) | Consider adding structured error logging for rejected auth attempts |
| `/api/auth/[...all]` | POST | public | Handled by Better Auth | ✅ 30 req/60 s per IP (`auth-post`) + 10/10 min per email + 5/10 min per email for magic-link | Email extracted from body clone | N/A | Handled by Better Auth | None (delegated) | None identified |

---

## UploadThing Handlers — `app/api/uploadthing/*`

| Router key | Class | Auth check | Rate limit | Input validation | Response shape | Observability | Gaps / follow-up |
|------------|-------|-----------|-----------|-----------------|---------------|---------------|-----------------|
| `avatarUploader` | authenticated | ✅ `auth.api.getSession` in middleware; throws `UploadThingError("No autorizado")` on missing session | SDK-level (Vercel WAF covers the HTTP route) | SDK validates file type (`image`) and size (`4MB` max, count `1`) | `{ uploadedBy, url }` | None | Add error logging when session check fails; see CRIS-266 for regression test |

**Note:** The UploadThing route handler at `/api/uploadthing` is created by
`createRouteHandler` and validated with the UploadThing SDK signature. The
`avatarUploader` middleware enforces session before any file is accepted.

---

## Server Actions — `actions/*`

All server actions live in files marked `"use server"` and call `requireSession()`
as their first operation. An unauthenticated caller receives a `NEXT_REDIRECT` to
`/ingresar`.

### `actions/combinations.ts`

| Action | Class | Auth check | Rate limit | Input validation | Observability | Gaps / follow-up |
|--------|-------|-----------|-----------|-----------------|---------------|-----------------|
| `saveCombination` | internal app action | ✅ `requireSession()` | None | ✅ Zod `combinationSchema` (name 2-60, description max 240, visibility enum, layoutJson any) | None | `layoutJson` is `z.any()` — no schema validation for layout shape. Follow-up: CRIS-264a |
| `forkPublicCombination` | internal app action | ✅ `requireSession()` | None | Source existence verified in DB; `sourceId` is a raw string | None | No Zod schema for `sourceId` — any string is accepted and silently returns no-op if not found |
| `deleteCombination` | internal app action | ✅ `requireSession()` | None | `id` is a raw string; ownership enforced by `deleteMany` WHERE clause | None | None identified |
| `markCombinationAsUsed` | internal app action | ✅ `requireSession()` | None | `combinationId` is a raw string | None | No bounds check; a valid session could call this at high frequency. Low risk. |
| `toggleFavoriteChannel` | internal app action | ✅ `requireSession()` | None | `channelId` is a raw string | None | None identified |
| `toggleFavoriteCombination` | internal app action | ✅ `requireSession()` | None | Validates `visibility: PUBLIC` in DB before toggling | None | None identified |
| `trackChannelView` | internal app action | ✅ `requireSession()` | None | `secondsWatched` defaults to 15 but accepts any number — no bounds check | None | No upper bound on `secondsWatched`. Low risk (data quality, not security). Follow-up: CRIS-264b |

### `actions/user.ts`

| Action | Class | Auth check | Rate limit | Input validation | Observability | Gaps / follow-up |
|--------|-------|-----------|-----------|-----------------|---------------|-----------------|
| `updateProfile` | internal app action | ✅ `requireSession()` | None | ✅ Zod `profileSchema` (name 2-80, image URL or empty) | None | None identified |
| `updatePreferences` | internal app action | ✅ `requireSession()` | None | ✅ Zod `preferencesSchema` (theme enum, booleans, grid preset enum) | None | None identified |
| `saveLayoutPreference` | internal app action | ✅ `requireSession()` | None | ✅ `dashboardLayoutSchema.parse(layoutJson)` | None | None identified |

---

## Middleware — `middleware.ts`

The Next.js middleware runs before protected route segments and auth pages:

| Route prefix | Behavior | Unauthenticated | Authenticated |
|-------------|---------|----------------|--------------|
| `/perfil/*` | protected | Redirect → `/ingresar` | Pass through |
| `/configuracion/*` | protected | Redirect → `/ingresar` | Pass through |
| `/mis-combinaciones/*` | protected | Redirect → `/ingresar` | Pass through |
| `/ingresar` | auth page | Pass through | Redirect → `/` |
| `/registrarse` | auth page | Pass through | Redirect → `/` |

Auth check: `getSessionCookie(request)` from `better-auth/cookies`. No DB call;
cookie presence is the signal.

---

## Security Headers

Configured in `next.config.ts` via the `headers()` export and applied to all
routes matching `/(.*)`; see `lib/security-headers.ts` (added in CRIS-266).

Key headers: `Content-Security-Policy`, `X-Content-Type-Options`,
`X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`,
`Permissions-Policy`.

See the regression test `lib/security-headers.test.ts` for exact assertions.

---

## Out of Scope (Private / Platform-Only)

- Vercel WAF rule IDs, Log vs Enforce mode, dashboard URLs → see `docs/runbooks/waf-protection.md`
- Better Auth OAuth provider secrets, magic-link token storage
- UploadThing signing secrets
- Incident-response procedures

---

## Follow-up Tickets Created

| ID | Title | Priority |
|----|-------|---------|
| CRIS-264a | Chore: add layout JSON schema validation to `saveCombination` | Low |
| CRIS-264b | Chore: add upper-bound validation on `secondsWatched` in `trackChannelView` | Low |

> Create these two Linear tickets under CRIS-262 in the same cycle as CRIS-264
> using the Linear MCP `save_issue` tool after the audit doc is committed.
