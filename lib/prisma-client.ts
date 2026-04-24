import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export type DatabaseDriver = "neon" | "pg";

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

export function getConnectionString() {
  const connectionString =
    process.env.PRISMA_DIRECT_TCP_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Configurá PRISMA_DIRECT_TCP_URL o DATABASE_URL para inicializar Prisma.",
    );
  }

  process.env.DATABASE_URL = connectionString;

  return connectionString;
}

export function createPrismaClient() {
  const connectionString = getConnectionString();
  const driver = resolveDatabaseDriver();
  const adapter =
    driver === "pg"
      ? new PrismaPg(connectionString)
      : new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
