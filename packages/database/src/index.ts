import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

export type { PrismaClient } from "./generated/prisma/client";
export { Prisma } from "./generated/prisma/client";

declare global {
  var __bordomPrisma: PrismaClient | undefined;
}

// pg-connection-string warns that sslmode=require/prefer/verify-ca are treated as
// aliases for verify-full today but will adopt weaker libpq semantics in a future
// major. We rely on the strict (verify-full) behavior, so pin it explicitly — the
// connection is identical today, minus the per-cold-start deprecation warning.
function pgConnectionString(): string | undefined {
  return process.env.DATABASE_URL?.replace(
    /sslmode=(?:require|prefer|verify-ca)\b/i,
    "sslmode=verify-full"
  );
}

// Prisma 7: connect through the pg driver adapter (no engine binary). Runtime
// uses the pooled DATABASE_URL; migrations use the direct URL via prisma.config.ts.
const adapter = new PrismaPg({ connectionString: pgConnectionString() });

export const prisma: PrismaClient =
  global.__bordomPrisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__bordomPrisma = prisma;
}
