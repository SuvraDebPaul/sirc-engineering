import { Breadcrumbs, type Crumb } from "@/components/shared/breadcrumbs";

/**
 * The tinted band at the top of an inner page: breadcrumbs above a title.
 *
 * It spans the full viewport width. The public layout leaves <main> unwrapped
 * and each page supplies its own Container, so this band simply sits outside
 * that container rather than needing to break out of one.
 *
 * The `<h1>` lives here, so every page that uses this band gets exactly one.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs = [],
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}) {
  return (
    <div className="mb-10 border-y bg-muted/40 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Breadcrumbs items={breadcrumbs} className="justify-center" />

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>

        {description && (
          <p className="max-w-2xl text-balance text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
