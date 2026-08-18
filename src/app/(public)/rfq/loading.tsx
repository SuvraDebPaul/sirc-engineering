import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/shared/skeleton";

/** Streaming boundary for the quotation form, which reads ?sku= and ?type=. */
export default function Loading() {
  return (
    <>
      <div className="mb-10 border-y bg-muted/40 py-10">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-9 w-80 max-w-[80vw]" />
        </div>
      </div>

      <Container className="pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
          <Skeleton className="h-[38rem] w-full rounded-2xl" />
          <div className="space-y-5">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        </div>
      </Container>
    </>
  );
}
