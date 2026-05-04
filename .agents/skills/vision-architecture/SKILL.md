---
name: vision-architecture
description: Use when planning or reviewing Vision AR architecture changes, including schema design, runtime boundaries, caching, auth, public APIs, Vercel deployment behavior, and follow-up issue breakdown.
---

# Vision Architecture

Use this skill for planning, technical design, architecture review, or when a ticket reveals broader structural risk.

Read root `AGENTS.md` first for current project context, workflow rules, and skill-maintenance expectations.

## Review Areas

- Data model and Prisma migrations
- Auth/session boundaries and protected routes
- Server/client component boundaries
- Vercel runtime, cache, preview, and production behavior
- External integrations: YouTube, RSS, UploadThing, email, GitHub, Linear, Neon
- Security, privacy, and public repository constraints

## Public API Security Review

When the change touches a `/api/*` route, a Server Action, or an integration endpoint, review each item from the checklist in `AGENTS.md` ("Public API & Server Action Security Review") and verify:

- Auth boundaries — authentication required; authorization scope correct
- Abuse controls — rate limits consistent with `docs/runbooks/rate-limiting.md`
- Input validation — request shape validated before expensive work
- Output sanitization — no secrets, paths, stack traces, or PII in responses
- Caching behavior — no user-scoped data served from a shared cache layer
- Observability — errors logged without secret values; throttle headers present
- Documentation boundary — private WAF/dashboard detail stays out of public files

## Output Standard

Produce implementation-ready plans with:

- Goal and success criteria
- Files or modules likely affected
- Data flow and failure modes
- Migration and rollback implications
- Validation path
- Follow-up Linear issues when scope exceeds the current ticket

Keep sensitive production details out of public docs. If private credentials or dashboards are required, stop at the public boundary and point to private maintainer skills.
