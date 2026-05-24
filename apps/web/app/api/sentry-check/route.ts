// TEMPORARY: preview-only verification that errors reach Sentry. Removed before
// merge to production.
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const marker = `sentry-preview-verification-${Date.now()}`;
  Sentry.captureException(new Error(marker));
  await Sentry.flush(2000);
  return NextResponse.json({ ok: true, marker });
}
