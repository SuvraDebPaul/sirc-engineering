import { Container } from "@/components/layout/container";
import { CatalogSkeleton, Skeleton } from "@/components/shared/skeleton";

/**
 * Streaming boundary for the catalogue listing.
 *
 * This route is server-rendered per request because it reads filter params,
 * so without a boundary the browser waits on the whole page before painting
 * anything. The shell ships immediately and the listing streams in behind it.
 */
export default function Loading() {
  return (
    <>
      <div className="mb-10 border-y bg-muted/40 py-10">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96 max-w-[80vw]" />
        </div>
      </div>

      <Container className="pb-20">
        <CatalogSkeleton />
      </Container>
    </>
  );
}
