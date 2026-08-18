import Link from "next/link";
import { Compass } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/** Catch-all 404 for the public site. Routes with their own not-found win. */
export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-28 text-center">
      <Compass className="size-14 text-muted-foreground/40" strokeWidth={1.25} aria-hidden="true" />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Page not found</h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you were after has moved or never existed. The catalogue and the services index are
        the two best places to pick the trail back up.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/products">Browse products</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/services">Our services</Link>
        </Button>
      </div>
    </Container>
  );
}
