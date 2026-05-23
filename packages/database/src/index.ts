import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

export type { PrismaClient } from "./generated/prisma/client";
export { Prisma } from "./generated/prisma/client";

declare global {
  var __bordonPrisma: PrismaClient | undefined;
}

// Prisma 7: connect through the pg driver adapter (no engine binary). Runtime
// uses the pooled DATABASE_URL; migrations use the direct URL via prisma.config.ts.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma: PrismaClient =
  global.__bordonPrisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__bordonPrisma = prisma;
}
