---
name: vision-implementation
description: Use when implementing Vision AR code changes in the Next.js, Prisma, Better Auth, Vercel, Docker, and GitHub workflow used by this repository, especially when a Linear ticket needs production-quality changes.
---

# Vision Implementation

Use this skill for code changes, refactors, bug fixes, feature work, and ticket implementation.

Read root `AGENTS.md` first for current project context, workflow rules, and skill-maintenance expectations.

## Defaults

- Build from `develop` and open feature PRs to `develop`.
- Keep production release work separate as `develop` to `main`.
- Prefer small, focused changes tied to a Linear issue.
- Preserve existing design system, Spanish product copy, and public repo documentation style.
- Do not commit generated artifacts unless the repo already tracks them intentionally.

## Stack Guidance

- Next.js App Router and React 19: prefer server components unless client interactivity is required.
- Prisma: schema changes require migrations and release migration awareness.
- Better Auth: keep auth/session work server-safe and avoid exposing provider secrets.
- Vercel: treat production env values as private; document names and behavior, not values.
- Docker Compose: keep it local-dev only unless a ticket explicitly changes deployment.

## Implementation Checklist

1. Read the touched area before editing.
2. Identify schema, auth, caching, runtime, and public API impact.
3. Update docs or runbooks when behavior or setup changes.
4. Add or update tests for reusable logic and regression-prone behavior.
5. Run the validation path from `vision-testing`.

Create follow-up Linear issues for architectural, security, or operational risks that should not be folded into the current ticket.
