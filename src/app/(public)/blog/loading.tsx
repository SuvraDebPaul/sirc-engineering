import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/shared/skeleton";

/** Streaming boundary for the blog index, which reads category/tag params. */
export default function Loading() {
  return (
    <>
      <div className="mb-10 border-y bg-muted/40 py-10">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-72" />
        </div>
      </div>

      <Container className="pb-20">
        <div className="lg:grid lg:grid-cols-[1fr_19rem] lg:gap-10">
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border bg-card">
                <Skeleton className="aspect-16/10 w-full rounded-none" />
                <div className="p-6">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-3 h-5 w-full" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-6 lg:mt-0">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        </div>
      </Container>
    </>
  );
}
