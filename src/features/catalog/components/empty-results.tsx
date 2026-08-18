import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Shown when the filters or the search match nothing.
 *
 * A dead end is the worst possible outcome of a filter click, so this offers
 * both ways out: clear everything, or ask us for the instrument directly. The
 * second route matters here — a buyer who filtered down to nothing is usually
 * looking for something specific, which is exactly who the RFQ form is for.
 *
 * Presentation comes from the shared `EmptyState`; this component owns only
 * the copy and the two escape routes.
 */
export function EmptyResults({
  clearHref,
  message,
  heading,
}: {
  clearHref: string;
  /** Overrides the default copy — a category with no stock is not the same
      situation as filters that matched nothing, and neither is a search. */
  message?: string;
  heading?: string;
}) {
  return (
    <EmptyState
      icon={PackageSearch}
      title={heading ?? (message ? "Nothing listed here yet" : "No instruments match those filters")}
      description={
        message ??
        "Try removing a filter or two. If you know the make and model you need, send it to us and we will source it and quote you."
      }
      actions={
        <>
          <Button asChild size="lg">
            <Link href={clearHref}>Clear all filters</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/rfq">Request a quotation</Link>
          </Button>
        </>
      }
    />
  );
}
