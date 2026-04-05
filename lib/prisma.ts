import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString =
  process.env.DATABASE_URL ?? process.env.PRISMA_DIRECT_TCP_URL;

if (!connectionString) {
  throw new Error(
    "Configurá DATABASE_URL para inicializar Prisma.",
  );
}

process.env.DATABASE_URL = connectionString;

const adapter = new PrismaNeon({
  connectionString,
});

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
