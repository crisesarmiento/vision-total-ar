import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export type DatabaseDriver = "neon" | "pg";

type PrismaEnv = {
  [key: string]: string | undefined;
  DATABASE_DRIVER?: string;
  DATABASE_URL?: string;
  PRISMA_DIRECT_TCP_URL?: string;
};

export function resolveDatabaseDriver(
  value = process.env.DATABASE_DRIVER,
): DatabaseDriver {
  if (!value || value === "neon") {
    return "neon";
  }

  if (value === "pg") {
    return "pg";
  }

  throw new Error(
    `Unsupported DATABASE_DRIVER "${value}". Use "neon" or "pg".`,
  );
}

function configuredValue(value: string | undefined) {
  return value?.trim() || undefined;
}

export function resolvePrismaConnectionConfig(env: PrismaEnv = process.env) {
  const driver = resolveDatabaseDriver(env.DATABASE_DRIVER);
  const connectionString =
    driver === "pg"
      ? configuredValue(env.DATABASE_URL) ??
        configuredValue(env.PRISMA_DIRECT_TCP_URL)
      : configuredValue(env.PRISMA_DIRECT_TCP_URL) ??
        configuredValue(env.DATABASE_URL);

  if (!connectionString) {
    throw new Error(
      "Configurá PRISMA_DIRECT_TCP_URL o DATABASE_URL para inicializar Prisma.",
    );
  }

  return {
    driver,
    connectionString,
  };
}

export function getConnectionString(env: PrismaEnv = process.env) {
  const connectionString =
    resolvePrismaConnectionConfig(env).connectionString;

  if (env === process.env) {
    process.env.DATABASE_URL = connectionString;
  }

  return connectionString;
}

export function createPrismaClient() {
  const { connectionString, driver } = resolvePrismaConnectionConfig();
  process.env.DATABASE_URL = connectionString;

  const adapter =
    driver === "pg"
      ? new PrismaPg(connectionString)
      : new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
