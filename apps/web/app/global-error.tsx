"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Catches errors in the root layout / render tree that escape normal error
// boundaries, reports them to Sentry, and shows a minimal recovery screen.
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#FFF8E1",
          color: "#1A1A1A",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: 24
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Something broke. 🎲</h1>
        <p style={{ maxWidth: 420, lineHeight: 1.5 }}>
          That one&apos;s on us — the error has been logged. Give it another go.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            border: "3px solid #1A1A1A",
            background: "#FF5C8A",
            padding: "12px 20px",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "4px 4px 0 #1A1A1A"
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
