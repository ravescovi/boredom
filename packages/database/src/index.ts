import { PrismaClient } from "@prisma/client";

export type { PrismaClient } from "@prisma/client";
export { Prisma } from "@prisma/client";

declare global {
  var __bordonPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__bordonPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__bordonPrisma = prisma;
}
