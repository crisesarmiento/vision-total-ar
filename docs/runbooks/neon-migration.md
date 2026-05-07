# Neon Migration Runbook

## Goal

Move Vision AR from Prisma Postgres to Neon while keeping Prisma ORM and the current PostgreSQL schema.

## Preconditions

- A Neon project and database are provisioned.
- You have the current production `DATABASE_URL` or an export path from the existing provider.
- Vercel project access is available for preview and production env changes.

## Cutover plan

1. Create the Neon database and copy the connection string.
2. Export the current schema and data from the existing production database.
3. Import schema and data into Neon.
4. Update preview env vars first:
   - `DATABASE_URL`
   - `PRISMA_DIRECT_TCP_URL`
   - any duplicated local env files used for validation
5. Validate in preview:
   - homepage renders
   - Better Auth session lookup works
   - public combo pages load
   - favorites and layout persistence still write correctly
6. Update production env vars:
   - `DATABASE_URL`
   - `PRISMA_DIRECT_TCP_URL`
7. Redeploy production and verify the same flows.

## Rollback

If preview or production fails after the switch:

1. Restore the previous runtime env vars:
   - `PRISMA_DIRECT_TCP_URL`
   - `DATABASE_URL` if it was changed
2. Trigger a fresh deployment.
3. Re-run homepage and auth verification.

## Pull request preview branches

The `.github/workflows/neon-preview-branches.yml` workflow manages Neon branch lifecycle for internal pull requests:

- On PR open, reopen, or synchronize, it creates or reuses a Neon branch named `preview/pr-<number>-<branch>`.
- On PR close, it deletes the matching Neon branch.
- Preview branches expire automatically after 14 days.
- The workflow uses the repository `NEON_PROJECT_ID` variable and `NEON_API_KEY` secret created by the Neon GitHub integration.
- Fork PRs are skipped so GitHub Actions does not try to access Neon secrets from untrusted pull requests.

This workflow does not inject `DATABASE_URL` or `PRISMA_DIRECT_TCP_URL` into Vercel preview deployments. Until a follow-up wires Vercel previews to the generated branch connection string, Vercel previews continue using their existing environment configuration.

## Repo changes included with this runbook

- Prisma runtime no longer depends on `@prisma/adapter-ppg`.
- The application now uses `@prisma/adapter-neon`.
- During migration, runtime prefers `PRISMA_DIRECT_TCP_URL` and falls back to `DATABASE_URL`.
