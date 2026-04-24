import { PrismaClient } from "@prisma/client";
import { createPrismaClient } from "@/lib/prisma-client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
