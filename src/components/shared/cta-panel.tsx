import { cn } from "@/lib/utils";

/**
 * The closing "talk to us" block that ends most index pages.
 *
 * Services, brands, industries and the foot of every article each ended with
 * the same tinted panel — heading, a line of copy, one or two buttons. Four
 * copies meant four places to update when the wording of the primary call to
 * action changed, and they had already drifted in padding and heading size.
 *
 * Deliberately unopinionated about the buttons: the useful action differs by
 * page, and forcing every panel to offer "request a quotation" would make the
 * one on the brands page wrong.
 */
export function CtaPanel({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border/60 bg-linear-to-b from-muted/50 to-muted/20 p-8 text-center shadow-sm sm:p-12",
        className,
      )}
    >
      <h2 className="text-xl font-bold tracking-tight uppercase sm:text-2xl">{title}</h2>

      {description && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{actions}</div>
    </section>
  );
}
