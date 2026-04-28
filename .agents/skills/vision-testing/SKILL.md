---
name: vision-testing
description: Use when deciding how to validate Vision AR changes, including lint, typecheck, unit tests, build, Docker Compose local setup, Vercel previews, production smoke checks, and reporting skipped validation.
---

# Vision Testing

Use this skill before finishing implementation, reviewing a PR, or debugging failed checks.

## Standard Validation

Run these for most code changes:

- `npm run lint`
- `npm run skills:validate` when `.agents/skills`, `docs/skills`, or the validator changes
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Targeted Validation

- Docker/local onboarding: run `docker compose config`, build or start services as needed, and verify seeded local data only against local/dev databases.
- Prisma schema changes: run migration checks and document production migration implications.
- Vercel behavior: use PR preview checks for UI/runtime changes; use production smoke checks only after a release or incident fix.
- Public routes: verify `/`, `/api/live`, and `/api/ticker` when runtime, database, or cache behavior changes.

## Reporting

Final PR notes should list commands run, results, and any skipped checks with a concrete reason. Never paste secrets or full environment files into logs, comments, or tickets.
