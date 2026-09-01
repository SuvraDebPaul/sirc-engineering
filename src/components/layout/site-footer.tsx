import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import Logo from "@/components/layout/logo";
import { SocialIcon } from "@/components/shared/social-icon";
import { Button } from "@/components/ui/button";
import { footerNav } from "@/config/site";
import { getSiteSettings } from "@/features/settings/services/settings";

/**
 * Site Footer — Balanced multi-column architecture.
 */
export async function Footer() {
  const year = new Date().getFullYear();
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-border/80 bg-linear-to-b from-muted/40 to-muted/80">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.3fr]">
          {/* Brand & Socials Column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
            <Logo src={settings.logoUrl ?? undefined} className="h-24 w-auto" />

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings.description}
            </p>

            {/* Accreditation Badge */}
            {/* <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              <span>ISO Accredited Lab Service</span>
            </div> */}

            <ul className="mt-5 flex items-center gap-2">
              {settings.socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="grid size-9 place-items-center rounded-full border border-border/70 bg-background text-muted-foreground shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md motion-reduce:transform-none"
                  >
                    <SocialIcon name={social.icon} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3 Evenly Balanced Nav Columns */}
          {footerNav.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-bold tracking-wider uppercase text-foreground">
                {column.title}
              </h2>

              <span
                aria-hidden="true"
                className="mt-2.5 block h-0.5 w-8 rounded-full bg-primary"
              />

              <ul className="mt-4 space-y-2.5">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-block text-xs sm:text-sm text-muted-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary motion-reduce:transform-none"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact & RFQ Column */}
          <section aria-labelledby="footer-contact">
            <h2
              id="footer-contact"
              className="text-xs font-bold tracking-wider uppercase text-foreground"
            >
              Talk to an engineer
            </h2>

            <span
              aria-hidden="true"
              className="mt-2.5 block h-0.5 w-8 rounded-full bg-primary"
            />

            <ul className="mt-4 space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <a
                  href={`tel:${settings.phone}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {settings.phone}
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all font-medium hover:text-primary transition-colors"
                >
                  {settings.email}
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">
                  {settings.address}
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{settings.hours}</span>
              </li>
            </ul>

            <Button
              asChild
              className="group mt-5 h-10 w-full rounded-full font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              <Link href="/rfq">
                <FileText className="size-4" aria-hidden="true" />
                <span>Request a Quotation</span>
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </section>
        </div>

        {/* Sub-Footer Legal Strip */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {settings.name}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              href="/returns"
              className="hover:text-primary transition-colors"
            >
              Refund & Returns
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
