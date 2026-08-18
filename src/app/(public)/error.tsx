"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { contactInfo } from "@/config/site";

/**
 * Error boundary for the public site.
 *
 * Shows the digest rather than the message: `error.message` is scrubbed in
 * production builds anyway, and the digest is the value that actually
 * correlates with the server log entry, so it is the useful thing for someone
 * to read out over the phone.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: forward to an error reporter once one is chosen.
    console.error("[public] unhandled error", error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center justify-center py-28 text-center">
      <AlertTriangle className="size-14 text-amber-500" strokeWidth={1.25} aria-hidden="true" />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Something went wrong</h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        This one is on us, not on you. Try again — and if it keeps happening, call{" "}
        <a href={`tel:${contactInfo.phone}`} className="font-medium text-primary hover:underline">
          {contactInfo.phone}
        </a>
        .
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </Container>
  );
}
