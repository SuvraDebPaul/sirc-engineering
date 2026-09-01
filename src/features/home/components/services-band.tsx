import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { SectionCta } from "@/features/home/components/section-cta";
import { Icon } from "@/components/shared/icon";
import type { ServiceHighlight } from "@/features/content/types";

/**
 * Laboratory Services Band — High-precision ISO/IEC 17025 accredited metrology & calibration.
 */
export function ServicesBand({ services }: { services: ServiceHighlight[] }) {
  if (services.length === 0) return null;

  return (
    <section
      aria-labelledby="services-heading"
      className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-b from-card via-card/95 to-muted/30 p-6 sm:p-10 lg:p-12 shadow-sm"
    >
      {/* Background ambient lighting accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl"
      />

      {/* Section Header */}
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-xs backdrop-blur-md mb-3">
          <span
            className="size-2 rounded-full bg-primary animate-pulse"
            aria-hidden="true"
          />
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          <span>ISO 17025 Accredited Facility</span>
        </div>

        <h2
          id="services-heading"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight"
        >
          Laboratory & Calibration Services
        </h2>

        <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
          Certified testing, inspection, and instrument calibration adhering to international metrology standards with unbroken traceability.
        </p>

        {/* 4-Pillar Trust Highlights Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-y border-border/60 py-4 text-xs font-semibold text-foreground/90">
          <div className="flex items-center gap-2">
            <Award
              className="size-4 text-amber-500 shrink-0"
              aria-hidden="true"
            />
            <span>ISO 17025 Accredited</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>Express Turnaround</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin
              className="size-4 text-blue-500 shrink-0"
              aria-hidden="true"
            />
            <span>On-Site Field Testing</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck2
              className="size-4 text-emerald-500 shrink-0"
              aria-hidden="true"
            />
            <span>Traceable Certificates</span>
          </div>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="relative z-10 mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={service.href}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:ring-1 hover:ring-primary/20 motion-reduce:transform-none"
          >
            {/* Image Header with Scrim */}
            <div className="relative aspect-16/10 overflow-hidden bg-muted border-b border-border/40">
              <Image
                src={service.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-black/10"
              />

              {/* Floating Turnaround Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                  <Clock className="size-3 text-amber-400" aria-hidden="true" />
                  <span>{service.turnaroundDays}-Day Turnaround</span>
                </span>
              </div>

              {/* Floating Service Icon */}
              <span className="absolute bottom-3 left-3 grid size-12 place-items-center rounded-xl border border-border/60 bg-background/95 text-primary shadow-md backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg">
                <Icon
                  name={service.icon}
                  className="size-6"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </span>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
                {service.title}
              </h3>

              <p className="mt-2.5 flex-1 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {service.description}
              </p>

              {/* Feature Chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2
                    className="size-3 shrink-0"
                    aria-hidden="true"
                  />
                  ISO 17025 Calibrated
                </span>

                {service.onSite && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                    <MapPin className="size-3 shrink-0" aria-hidden="true" />
                    On-Site Available
                  </span>
                )}
              </div>

              {/* Card Footer CTA */}
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-xs sm:text-sm font-semibold text-primary">
                <span>View Scope & Tolerances</span>
                <span className="grid size-7 place-items-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="relative z-10 mt-8">
        <SectionCta href="/services" label="Explore All Calibration Services" />
      </div>
    </section>
  );
}
