import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { getSiteSettings } from "@/features/settings/services/settings";

export const metadata: Metadata = {
  title: "Return & refund policy",
  description: "What happens if an order arrives wrong, damaged, or you want to refuse it.",
};

/**
 * Return & refund policy.
 *
 * ⚠️ **Requires a business decision before launch, not just legal review.**
 * Because checkout only offers cash on delivery (see `checkout.ts`), nothing
 * is charged until the courier hands the order over — so most of what a
 * typical refund policy covers (processing a payment reversal) doesn't apply
 * yet. What's missing is the two or three numbers only the business can set:
 * how many days after delivery a fault can be reported, and who pays return
 * shipping. Both are flagged inline rather than invented.
 */
function buildSections(settings: {
  name: string;
  email: string;
  phone: string;
}): { heading: string; paragraphs: string[] }[] {
  return [
    {
      heading: "Refusing delivery",
      paragraphs: [
        "Because payment is collected as cash on delivery, you are never charged until you accept the order from the courier. If it isn't what you expected, you can refuse it at the door — nothing is charged, and you don't need to contact us first, though it helps us if you do so we can find out what went wrong.",
      ],
    },
    {
      heading: "Wrong, damaged or faulty items",
      paragraphs: [
        `Contact us at ${settings.email} or ${settings.phone} as soon as you notice a problem, with your order reference and a photo where relevant. We will confirm next steps — a replacement, a repair, or collection of the item — once we've seen what's wrong.`,
      ],
    },
    {
      heading: "Change of mind",
      paragraphs: [
        "Before dispatch, cancelling is straightforward — see our Terms of service. After delivery, an instrument can only be returned for a change of mind if it is unused, in its original packaging, and you contact us first to arrange it. Calibrated instruments, consumables, and any service performed to your specification (custom calibration scope, a bespoke report) cannot be returned once delivered, since the work itself is not undoable.",
      ],
    },
    {
      heading: "Calibration, testing and inspection services",
      paragraphs: [
        "A completed calibration, test or inspection cannot be \"returned\" — if you believe the work itself was performed incorrectly, contact us and we will investigate and re-perform it at no charge if we find fault on our side.",
      ],
    },
    {
      heading: "Getting in touch",
      paragraphs: [
        `The fastest way to resolve a delivery problem is to contact us directly — ${settings.email} or ${settings.phone} — with your order reference. We will always tell you plainly what we can and can't do, rather than leave you guessing.`,
      ],
    },
  ];
}

export default async function ReturnsPage() {
  const settings = await getSiteSettings();
  const SECTIONS = buildSections(settings);

  return (
    <>
      <PageHeader
        title="Return & refund policy"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Return & refund policy" }]}
      />

      <Container className="pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Draft — needs a business decision, not just review.</span>{" "}
              A specific reporting window for faults (e.g. &quot;within 7 days of delivery&quot;) and who
              pays return shipping are policy choices this page doesn&apos;t set yet — it currently
              routes every case to direct contact instead of guessing.
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
            Have an issue with an order?{" "}
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
