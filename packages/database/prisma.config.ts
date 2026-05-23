import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moves connection config out of schema.prisma into this file, and does
// NOT auto-load .env — hence the dotenv import (loads packages/database/.env for
// local CLI use; CI/Vercel inject env vars directly).
//
// The CLI (migrate/db) uses this datasource URL; the runtime client connects via
// the pg driver adapter in src/index.ts instead. Migrations run over Neon's
// DIRECT (unpooled) connection — the PgBouncer pooler is unreliable for advisory
// locks/DDL. Read process.env directly (not env()) so `prisma generate`, which
// needs no connection, never fails when the var is absent.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? ""
  }
});
