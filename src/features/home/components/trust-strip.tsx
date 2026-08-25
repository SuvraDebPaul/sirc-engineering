import { Icon } from "@/components/shared/icon";
import type { Feature } from "@/features/content/types";

/**
 * Trust strip.
 *
 * The reference design puts generic ecommerce promises here — free shipping,
 * money back. Those mean little on capital equipment. These are the four
 * things an industrial buyer actually weighs when choosing a supplier.
 *
 * Dividers come from `gap-px` over a tinted container rather than `divide-*`
 * utilities: in a grid, `divide-x` borders every child after the first, which
 * puts a stray line down the left edge of every row after the first once the
 * grid wraps to two columns. The gap trick is correct at every breakpoint
 * without counting children.
 *
 * Items align to the top, not centre. Descriptions run to one line or two
 * depending on the wording, and centring each item independently leaves the
 * icons sitting at four different heights across the row.
 *
 * No hover state: nothing here is a link, and hover feedback on static
 * content reads as an affordance that isn't there.
 */
export function TrustStrip({ features }: { features: Feature[] }) {
  if (features.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <ul className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <li key={feature.id} className="flex items-start gap-4 bg-card p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon name={feature.icon} className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p className="text-sm leading-snug font-semibold">{feature.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
