import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/features/enquiries/components/contact-form";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { getSiteSettings } from "@/features/settings/services/settings";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Call, email or send us a message. An engineer replies within one working day.",
};

/**
 * Contact page — map beside the form, then a row of detail tiles.
 *
 * The map is an OpenStreetMap embed rather than Google Maps: no API key, no
 * billing account, and it does not drop advertising cookies on a page the
 * visitor only opened to find a phone number. It is centred on Dhaka rather
 * than dropping a pin — an admin-entered address has no coordinates to plot,
 * so a marker on a guessed building would be worse than no marker.
 */
/** Dhaka, wide enough that it reads as "the city" rather than "this building". */
const MAP_SRC =
  "https://www.openstreetmap.org/export/embed.html?bbox=90.33%2C23.70%2C90.46%2C23.82&layer=mapnik";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const TILES = [
    { icon: MapPin, label: "Visit us", value: settings.address },
    { icon: Phone, label: "Call us", value: settings.phone, href: `tel:${settings.phone}` },
    { icon: Mail, label: "Mail us", value: settings.email, href: `mailto:${settings.email}` },
    { icon: Clock, label: "Open hours", value: settings.hours },
  ];

  return (
    <>
      <PageHeader
        title="Contact us"
        description="Call, email, or send the details and we will come back to you within one working day."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact us" }]}
      />

      <Container className="pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="min-h-96 overflow-hidden rounded-2xl border bg-muted">
            <iframe
              src={MAP_SRC}
              title="Map of Dhaka, Bangladesh"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full min-h-96 border-0"
            />
          </div>

          <ContactForm phone={settings.phone} />
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-start gap-4 rounded-2xl bg-muted/40 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-background text-primary shadow-sm">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>

              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{label}</span>

                {href ? (
                  <a href={href} className="block break-words text-sm font-medium hover:text-primary">
                    {value}
                  </a>
                ) : (
                  <span className="block break-words text-sm font-medium">{value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
