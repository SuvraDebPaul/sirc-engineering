import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { getSiteSettings } from "@/features/settings/services/settings";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What data this site collects, why, and how long it is kept.",
};

/**
 * Privacy policy.
 *
 * ⚠️ **Requires legal review before launch.** This is written from what the
 * code actually does — which is the only honest starting point, and already
 * more accurate than the WordPress boilerplate it replaces — but a privacy
 * policy is a legal document and this one has not been reviewed by anyone
 * qualified. It also cannot describe practices that happen off the website
 * (how enquiries are handled internally, how long invoices are retained,
 * whether a courier receives customer addresses), and those need adding.
 *
 * Every claim below was checked against the source:
 *  - no analytics package is installed
 *  - no advertising or tracking cookies are set
 *  - cart and wishlist are `localStorage`, never transmitted
 *  - the only data leaving the browser is what someone types into a form
 *  - the one third party is the OpenStreetMap embed on the contact page
 *
 * If any of that changes, this page must change with it.
 */
function buildSections(settings: {
  name: string;
  address: string;
  email: string;
  phone: string;
}): { heading: string; paragraphs: string[] }[] {
  return [
  {
    heading: "Who we are",
    paragraphs: [
      `This site is operated by ${settings.name}, ${settings.address}. If you have any question about how your information is handled, contact us at ${settings.email} or ${settings.phone}.`,
    ],
  },
  {
    heading: "What we collect, and when",
    paragraphs: [
      "We collect information in only one way: when you type it into a form and submit it. There is no account system on this site, no sign-in, and no profile.",
      "The quotation form collects your name, company, department, job title, email address, phone number, the model you are asking about, quantity and your message. The contact form collects your name, email address, an optional phone number, a subject and your message. The comment form on articles collects your name, email address and your comment. The checkout collects your name, company, phone number, email address and delivery address.",
      "We ask for a phone number on the quotation form because instrument specifications are usually resolved faster by conversation than by email. It is used for that and nothing else.",
    ],
  },
  {
    heading: "What we do not collect",
    paragraphs: [
      "This site runs no analytics, no advertising pixels and no third-party tracking scripts. We do not know who you are, which pages you visited, or where you came from.",
      "We never collect card numbers, CVV codes or expiry dates. No payment is taken on this website at all — orders are confirmed by our sales desk and invoiced, and payment is settled by bank transfer, purchase order or on delivery.",
    ],
  },
  {
    heading: "Cookies and local storage",
    paragraphs: [
      "This site sets no advertising or analytics cookies, so there is no consent banner to dismiss.",
      "Your cart and your wishlist are stored in your own browser using local storage. That data never leaves your device and is never sent to us — it is why both survive a refresh without you needing an account. Clearing your browser data clears both.",
    ],
  },
  {
    heading: "Third parties",
    paragraphs: [
      "The contact page embeds a map from OpenStreetMap so you can see where we are. Loading that map means your browser contacts openstreetmap.org, which will see your IP address as it would for any website you visit. We chose OpenStreetMap over commercial alternatives specifically because it does not profile visitors for advertising.",
      "We do not sell, rent or share your information with anyone for marketing purposes.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "Enquiries and quotations are kept for as long as we have an active commercial relationship with you, and afterwards for the period we are required to retain business records.",
      "Comments submitted on articles are held for moderation and either published or discarded.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can ask us what information we hold about you, ask us to correct it, or ask us to delete it. Write to us at the email address above and we will respond.",
      "Because there is no account system, there is nothing for you to log in to and delete — everything we hold came from a form you submitted or a transaction we completed.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "If we add anything that changes what is collected — analytics, a payment processor, a newsletter — this page will be updated before that change goes live, not after.",
    ],
  },
  ];
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const SECTIONS = buildSections(settings);

  return (
    <>
      <PageHeader
        title="Privacy policy"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy policy" }]}
      />

      <Container className="pb-20">
        <div className="mx-auto max-w-3xl">
          {/* Visible to the business, not just buried in a code comment — the
              people who need to action this will never read the source. */}
          <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Draft — pending legal review.</span> This
              policy describes what the website does, verified against the code. It has not been
              reviewed by a lawyer and does not yet cover how enquiries are handled internally after
              they reach us.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-bold uppercase tracking-tight">{section.heading}</h2>

                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 border-t pt-6 text-sm text-muted-foreground">
            Questions about any of this?{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </Container>
    </>
  );
}
