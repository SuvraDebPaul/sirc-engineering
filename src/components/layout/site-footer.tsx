import Link from "next/link";
import { Clock, FileText, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import Logo from "@/components/layout/logo";
import { SocialIcon } from "@/components/shared/social-icon";
import { Button } from "@/components/ui/button";
import { footerNav } from "@/config/site";
import { getSiteSettings } from "@/features/settings/services/settings";

/**
 * Site footer.
 *
 * Replaces a shadcn demo block that carried twenty links to `#`, the strapline
 * "Finely crafted blocks built with Shadcn UI." and a 2024 copyright, while
 * `footerNav` and `contactInfo` sat unused in the config. Everything below is
 * read from that config, so the footer cannot drift from the rest of the site.
 *
 * The reference design ends with a newsletter signup. There is nowhere to send
 * an address — no list, no provider — so rather than collect emails into a
 * function that discards them, that column is a direct line to the sales desk.
 * It is the more useful column for a business that sells by quotation anyway.
 *
 * The year is computed at render. A hardcoded one silently goes stale, which
 * is exactly what happened to the block this replaces.
 */
export async function Footer() {
  const year = new Date().getFullYear();
  const settings = await getSiteSettings();

  return (
    <footer className="mt-20 border-t bg-muted/30">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.3fr]">
          <div>
            <Logo src={settings.logoUrl ?? undefined} className="h-14 w-auto" />

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings.description}
            </p>

            <ul className="mt-5 flex items-center gap-2">
              {settings.socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="grid size-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <SocialIcon name={social.icon} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerNav.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold tracking-tight">
                {column.title}
              </h2>

              <ul className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <section aria-labelledby="footer-contact">
            <h2
              id="footer-contact"
              className="text-sm font-semibold tracking-tight"
            >
              Talk to an engineer
            </h2>

            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <a
                  href={`tel:${settings.phone}`}
                  className="hover:text-primary"
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
                  className="break-all hover:text-primary"
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
                <span className="text-muted-foreground">
                  {settings.hours}
                </span>
              </li>
            </ul>

            <Button asChild className="mt-5 w-full">
              <Link href="/rfq">
                <FileText className="size-4" aria-hidden="true" />
                Request a quotation
              </Link>
            </Button>
          </section>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {settings.name}. All rights reserved.
          </p>

          <p>{settings.shortDescription}</p>
        </div>
      </Container>
    </footer>
  );
}
