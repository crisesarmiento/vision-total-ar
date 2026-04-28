---
name: vision-infra
description: Use when working on public-safe Vision AR infrastructure workflows, including Vercel, Neon, GitHub Actions, release automation, production migration runbooks, CI, branch protection, and deployment validation.
---

# Vision Infra

Use this skill for infrastructure, release, CI/CD, Vercel, Neon, and GitHub Actions work.

Read root `AGENTS.md` first for current project context, workflow rules, and skill-maintenance expectations.

## Public-Safe Rules

- Document environment variable names, not values.
- Use protected GitHub environments for production operations.
- Use `prisma migrate deploy` for production database migrations.
- Keep Docker Compose local-dev only unless a ticket explicitly changes deployment.
- Do not paste provider secrets, connection strings, private dashboard URLs, or account-specific paths into public files.

## Common Checks

- CI changes should preserve lint, skill validation, typecheck, tests, and build.
- Release changes should respect `develop` as integration and `main` as production.
- Migration changes should update the production migration runbook and PR checklist.
- Vercel changes should verify preview and production behavior separately.

For incidents requiring private credentials or dashboards, use private maintainer skills and record only public-safe evidence in issues and PRs.
