import Image from "next/image";

import { Container } from "@/components/layout/container";
import { StatCounter } from "@/components/motion/stat-counter";

/**
 * Full-bleed credibility band — a deliberate break from the light card
 * rhythm around it, the way a premium landing page uses exactly one dark
 * moment for weight rather than decorating every section equally.
 *
 * Every number here is computed from the same live queries the rest of the
 * home page already runs (`products.length`, `brands.length`, and so on) —
 * nothing is a business claim. That is not a stylistic choice: the About
 * page's own stats band ships with placeholder dashes and an explicit code
 * comment refusing to invent figures like "18 years in operation", because
 * that is a claim about a real company that a customer or an auditor could
 * hold against it. Catalogue counts carry no such risk — they are true today
 * by construction, and they grow on their own as stock is added, rather than
 * going stale the way a hardcoded figure would.
 */
export interface Stat {
  value: number;
  label: string;
}

export function StatsBand({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section aria-labelledby="stats-heading" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/catalog/svc-calibration.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/92 via-black/75 to-black/55"
        />
      </div>

      <Container className="py-14 sm:py-20">
        <h2 id="stats-heading" className="sr-only">
          SIRC by the numbers
        </h2>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-l-2 border-primary/70 pl-4">
              <dd className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                <StatCounter value={stat.value} />
              </dd>
              <dt className="mt-1.5 text-sm text-white/70">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
