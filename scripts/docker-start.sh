#!/bin/sh
set -eu

POSTGRES_HOST="${POSTGRES_HOST:-db}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-vision_total_ar}"
POSTGRES_USER="${POSTGRES_USER:-vision_ar}"

DATABASE_URL_VALUE="postgresql:""//${POSTGRES_USER}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

export DATABASE_URL="$DATABASE_URL_VALUE"
export PRISMA_DIRECT_TCP_URL="$DATABASE_URL_VALUE"

if [ -z "${BETTER_AUTH_SECRET:-}" ]; then
  LOCAL_AUTH_VALUE="local-""development-""only-""not-""a-""secret"
  export BETTER_AUTH_SECRET="$LOCAL_AUTH_VALUE"
fi

npm run prisma:generate
npm run db:push
npm run db:seed

exec npm run dev -- --hostname 0.0.0.0
