import Link from "next/link";
import { PackageX } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/**
 * Shown when a slug matches no product.
 *
 * Scoped to this route rather than the global 404 so it can offer the two
 * things someone who followed a dead product link actually wants: the rest of
 * the catalogue, or a way to ask us for the instrument by name.
 */
export default function ProductNotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-28 text-center">
      <PackageX className="size-14 text-muted-foreground/40" strokeWidth={1.25} aria-hidden="true" />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">We could not find that product</h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        It may have been discontinued or replaced by a newer model. Browse the catalogue, or tell us
        the make and model you need and we will source it.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/products">Browse all products</Link>
        </Button>

        <Button asChild variant="outline" size="lg">
          <Link href="/rfq">Request a quotation</Link>
        </Button>
      </div>
    </Container>
  );
}
