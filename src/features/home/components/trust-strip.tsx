import { Icon } from "@/components/shared/icon";
import type { Feature } from "@/features/content/types";

/**
 * Trust strip.
 *
 * The reference design puts generic ecommerce promises here — free shipping,
 * money back. Those mean little on capital equipment. These are the four
 * things an industrial buyer actually weighs when choosing a supplier.
 */
export function TrustStrip({ features }: { features: Feature[] }) {
  if (features.length === 0) return null;

  return (
    <section className="rounded-2xl border bg-card">
      <ul className="grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {features.map((feature) => {

          return (
            <li key={feature.id} className="flex items-center gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon name={feature.icon} className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
