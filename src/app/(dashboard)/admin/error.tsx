"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary for the admin panel.
 *
 * Scoped under `/admin` rather than at the app root, so the sidebar (from
 * `layout.tsx`, a parent of this boundary) stays visible and staff can
 * navigate away instead of being dropped on Next's raw error screen.
 *
 * Shows the digest rather than the message — see the identical note in the
 * public error boundary.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: forward to an error reporter once one is chosen.
    console.error("[admin] unhandled error", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <AlertTriangle className="size-14 text-amber-500" strokeWidth={1.25} aria-hidden="true" />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Something went wrong</h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        This page hit an error. Try again, or head back to the dashboard — the rest of the admin
        panel is unaffected.
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
