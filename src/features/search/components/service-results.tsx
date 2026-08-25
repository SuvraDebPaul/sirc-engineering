import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Icon } from "@/components/shared/icon";
import type { SearchResult } from "@/features/search/services/site-search";

/**
 * Service hits on the search page.
 *
 * Rendered above the catalogue results rather than below. Someone searching
 * "calibration" or "thermography" is usually after the laboratory service, not
 * an instrument that happens to mention the word — and there are only ever a
 * handful of services, so putting them first costs almost no vertical space
 * while a matching one sitting under twelve products would never be seen.
 */
export function ServiceResults({ services }: { services: SearchResult[] }) {
  if (services.length === 0) return null;

  return (
    <section aria-labelledby="service-results-heading" className="mb-10">
      <h2 id="service-results-heading" className="text-sm font-semibold tracking-wide uppercase">
        Services
        <span className="ml-2 font-normal text-muted-foreground normal-case">
          {services.length} {services.length === 1 ? "match" : "matches"}
        </span>
      </h2>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.id}>
            <Link
              href={service.href}
              className="group flex h-full cursor-pointer items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transform-none"
            >
              <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                {service.imageUrl ? (
                  <Image src={service.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <Icon
                    name={service.icon}
                    className="size-5 text-muted-foreground"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold transition-colors duration-200 group-hover:text-primary">
                  {service.title}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                  {service.subtitle}
                </span>
              </span>

              <ArrowUpRight
                className="size-4 shrink-0 text-primary transition-transform duration-300 group-hover:rotate-45 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
