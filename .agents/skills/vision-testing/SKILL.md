---
name: vision-testing
description: Use when deciding how to validate Vision AR changes, including lint, typecheck, unit tests, build, Docker Compose local setup, Vercel previews, production smoke checks, and reporting skipped validation.
---

# Vision Testing

Use this skill before finishing implementation, reviewing a PR, or debugging failed checks.

Read root `AGENTS.md` first for current project context, workflow rules, and skill-maintenance expectations.

## Standard Validation

Run these for most code changes:

- `npm run lint`
- `npm run skills:validate` when `.agents/skills`, `docs/skills`, `AGENTS.md`, or the validator changes
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Targeted Validation

- GitHub Actions workflow changes: run `npm run actions:lint`.
- Docker/local onboarding: run `docker compose config`, build or start services as needed, and verify seeded local data only against local/dev databases.
- Prisma schema changes: run migration checks and document production migration implications.
- Vercel behavior: use PR preview checks for UI/runtime changes; use production smoke checks only after a release or incident fix.
- Public routes: verify `/`, `/api/live`, and `/api/ticker` when runtime, database, or cache behavior changes.
- Public API / server action changes: verify auth boundaries, confirm `429` + `Retry-After` headers on throttled responses, and check output sanitization (no secrets or PII); apply the security review checklist in `AGENTS.md` and report reviewed items in the PR body.

## Reporting

Final PR notes should list commands run, results, and any skipped checks with a concrete reason. Never paste secrets or full environment files into logs, comments, or tickets.
