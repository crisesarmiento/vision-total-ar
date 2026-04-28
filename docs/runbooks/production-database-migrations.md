# Production Database Migrations

## Goal

Keep Vercel production deploys and the Neon production schema in sync. Production must use Prisma's deploy command, not local-development schema commands.

This runbook was added after CRIS-254, where production returned 500 because `public.saved_combination` did not exist in the connected database.

## Required GitHub setup

Create a GitHub Environment named `production` and configure:

- Required reviewers for manual approval before the workflow can access secrets.
- Environment secret `PRODUCTION_DATABASE_URL` with the Neon production direct database connection string.

Do not store this value in repository variables, commit it, or paste it in tickets or PRs.

## Commands

- Local development: `npm run prisma:migrate`
- Local Docker/dev setup: `npm run db:setup`
- Production status check: `npm run prisma:migrate:status`
- Production migration apply: `npm run prisma:migrate:deploy`

Never use `npm run db:push`, `prisma migrate dev`, or `npm run db:seed` against production.

## Standard release flow

1. Before opening or merging a `develop` -> `main` release PR, inspect whether the release includes changes under `prisma/migrations`.
2. Run the `Production Database Migrations` GitHub workflow with `command=status`.
3. If status reports pending migrations, run the same workflow with `command=deploy`.
4. Wait for the workflow to finish and attach the run URL or summary to the release PR.
5. Merge the release PR to `main`.
6. Verify the Vercel production deployment and the key routes below.

If a production migration is required before the app code deploys, run `deploy` immediately before merging the release PR and keep the release window short.

## Emergency local fallback

Prefer the GitHub workflow because the `production` environment can require approval and keeps secrets out of local shells.

If the GitHub workflow is unavailable during an incident:

```bash
vercel env pull /tmp/vision-total-ar.production.env --environment=production --yes
set -a
. /tmp/vision-total-ar.production.env
set +a
export DATABASE_URL="${PRISMA_DIRECT_TCP_URL:-$DATABASE_URL}"
npm run prisma:migrate:status
npm run prisma:migrate:deploy
rm -f /tmp/vision-total-ar.production.env
```

Do not paste the env file contents into logs, tickets, or chat.

## Verification

After migrations and production deployment, verify:

- `https://vision-total-ar.vercel.app/` returns 200.
- `https://vision-total-ar.vercel.app/api/live` returns 200.
- `https://vision-total-ar.vercel.app/api/ticker` returns 200.
- Public combo pages render.
- Auth/session lookup still works for protected pages.
- Vercel logs do not show Prisma missing-table errors.

## Rollback

Schema rollback is not automatic. If a migration breaks production:

1. Stop further release deploys.
2. Restore the previous Vercel deployment if app code caused the issue.
3. Use Neon point-in-time restore or a database branch restore if schema/data caused the issue.
4. Update Vercel production env vars only if the rollback requires pointing back to a previous Neon branch.
5. Open a Linear incident issue with the migration name, deployment ID, and rollback action taken.
