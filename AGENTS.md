# Agent Instructions

This file defines repo-wide guidance for AI agents working on Vision AR. Keep it public-safe because this repository is public.

## Source Of Truth

- Product code, docs, and workflows live in this repository.
- Repo-scoped public skills live in `.agents/skills`.
- Private or credential-adjacent workflows belong in `~/.codex/skills` or a private skills repo/plugin, not in this repository.

## Workflow

- Start feature, fix, and chore work from updated `develop`.
- Open work PRs to `develop`.
- Use `main` only for release PRs from `develop` to production.
- Include the Linear issue ID in branch names, commits when practical, and PR title or body.
- Do not bypass review, CI, branch protection, production migration gates, or `SECURITY.md`.

## Skill Maintenance

When a change affects project workflow, architecture, testing, infrastructure, documentation standards, or design conventions, check whether a repo skill under `.agents/skills` must be updated.

Update the relevant skill in the same PR when the new behavior is part of the implemented change. If the skill update is related but out of scope, create a Linear follow-up ticket and mention it in the PR.

Relevant skills:

- `vision-ticket-flow`: branch, PR, Linear, GitHub Project, release workflow
- `vision-implementation`: coding conventions and stack-specific implementation guidance
- `vision-testing`: validation commands and testing strategy
- `vision-architecture`: schema, auth, runtime, caching, integrations, data flow
- `vision-documentation`: README, runbooks, PR/Linear/release notes
- `vision-design`: reusable UI/design conventions
- `vision-infra`: Vercel, Neon, GitHub Actions, migrations, releases

Run `npm run skills:validate` when `.agents/skills`, `docs/skills`, `scripts/validate-skills.mjs`, or this file changes.

## Public Safety

- Do not commit credentials, environment values, database URLs, API keys, private dashboard URLs, or personal account paths.
- Document environment variable names and public behavior only.
- For security vulnerabilities, follow `SECURITY.md` and avoid public exploit details.
- If private operational detail is required, stop at the public boundary and point maintainers to private skills or private systems.

## Validation

Use the validation path appropriate to the change. The default full path is:

- `npm run skills:validate`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

If any validation is skipped, state the reason in the PR.
