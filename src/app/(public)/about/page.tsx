import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClipboardCheck, MessageSquare, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Who we are: an instrument supplier with its own calibration laboratory, serving industry across Bangladesh.",
};

/**
 * About page.
 *
 * Follows the reference layout — tabbed intro, image collage, vision
 * accordion, three capability cards, a statistics band and a closing call to
 * action.
 *
 * ⚠️ **The statistics band is the one thing here that must not ship
 * unreviewed.** The reference fills it with "18+ years / 200+ employees / 27+
 * awards". Those are claims about a real company, and inventing them would put
 * false statements in front of every customer and every auditor who reads this
 * page. The figures below are placeholders marked as such in the UI itself,
 * and the business must supply the real ones or the band must be removed.
 */
const CAPABILITIES = [
  {
    icon: ClipboardCheck,
    title: "Specify with us",
    body: "Tell us the measurement, not the model. We will tell you what the job actually requires — including when it is less than you were about to buy.",
  },
  {
    icon: ShieldCheck,
    title: "Certified in-house",
    body: "Instruments are calibrated in our own laboratory before dispatch, with as-found and as-left values and stated uncertainty on the certificate.",
  },
  {
    icon: MessageSquare,
    title: "Supported afterwards",
    body: "Recall reminders before certificates lapse, on-site service where the instrument cannot leave the process, and engineers who answer the phone.",
  },
];

/** Placeholder figures. See the warning above — these are not real. */
const STATS = [
  { value: "—", label: "Years in operation" },
  { value: "—", label: "Instruments calibrated" },
  { value: "—", label: "Client sites served" },
  { value: "—", label: "Districts covered" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About us"
        description="An instrument supplier with its own calibration laboratory — so the people who sell you the meter are the people who certify it."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About us" }]}
      />

      <Container className="pb-20">
        <Tabs defaultValue="who" className="mx-auto max-w-4xl">
          <TabsList className="mx-auto h-auto justify-center gap-1 bg-transparent p-0">
            {[
              { value: "who", label: "Who we are" },
              { value: "how", label: "How we work" },
              { value: "why", label: "Why it matters" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 rounded-2xl border p-6 text-sm leading-relaxed text-muted-foreground sm:p-8">
            <TabsContent value="who" className="space-y-4">
              <p>
                SIRC supplies industrial measurement instruments and provides the testing,
                inspection and calibration services that keep them trustworthy. We are based in
                Bangladesh and work across the country — textiles, pharmaceuticals, power
                generation, gas, construction and manufacturing.
              </p>
              <p>
                Most suppliers sell you an instrument and send you elsewhere for its certificate. We
                do both, which means the people who recommended the meter are the people who
                calibrate it, and there is nobody to point at when a reading is questioned.
              </p>
            </TabsContent>

            <TabsContent value="how" className="space-y-4">
              <p>
                Every instrument we supply is function-checked and certified before dispatch. Every
                certificate carries as-found and as-left values, the stated measurement uncertainty
                and the reference standard used — the things an auditor actually asks for.
              </p>
              <p>
                We keep your due dates and contact you before they lapse. Work is scheduled around
                your maintenance windows rather than ours, and where an instrument cannot leave the
                process, we come to it.
              </p>
            </TabsContent>

            <TabsContent value="why" className="space-y-4">
              <p>
                A measurement is only worth what you can defend. An uncalibrated instrument does not
                announce itself — it quietly produces plausible numbers that pass unnoticed until an
                audit, a failure or an insurance claim puts weight on them.
              </p>
              <p>
                That is the whole business: making sure the number on the display can be traced back
                to a national standard, and that you can prove it years later.
              </p>
            </TabsContent>
          </div>
        </Tabs>

        {/* Collage */}
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
            <Image
              src="/images/catalog/svc-calibration.jpg"
              alt="Instrument being calibrated in the SIRC laboratory"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="grid gap-4">
            <div className="relative aspect-16/9 overflow-hidden rounded-2xl bg-muted">
              <Image
                src="/images/catalog/svc-testing.jpg"
                alt="Acceptance testing before dispatch"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                <Image
                  src="/images/catalog/svc-inspection.jpg"
                  alt="On-site inspection work"
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                <Image
                  src="/images/catalog/hero-2.jpg"
                  alt="Measurement instruments in use"
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vision / mission */}
        <section className="mt-16 grid items-center gap-10 rounded-2xl bg-muted/40 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold uppercase leading-tight tracking-tight sm:text-3xl">
              Accuracy, traceability
              <br />
              and answering the phone.
            </h2>

            <p className="mt-4 text-sm text-muted-foreground">
              Three commitments that decide whether a supplier is worth keeping.
            </p>

            <Accordion type="single" collapsible defaultValue="vision" className="mt-6">
              <AccordionItem value="vision">
                <AccordionTrigger className="text-sm font-medium">Our vision</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  That no measurement taken in Bangladeshi industry has to be qualified with
                  &ldquo;as far as we know&rdquo;. Every reading should be traceable, and every
                  certificate should survive scrutiny.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="mission">
                <AccordionTrigger className="text-sm font-medium">Our mission</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  To supply the right instrument for the job, certify it properly, and keep it
                  certified — so our customers spend their time using measurements rather than
                  defending them.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support">
                <AccordionTrigger className="text-sm font-medium">Our support</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  Local service and spares, on-site work where the process cannot stop, and recall
                  reminders that arrive before the due date rather than after it.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
            <Image
              src="/images/catalog/hero-1.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* Capabilities */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {CAPABILITIES.map(({ icon: Icon, title, body }) => (
            <section key={title} className="rounded-2xl border bg-card p-8 text-center">
              <Icon className="mx-auto size-10 text-primary" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </section>
          ))}
        </div>

        {/* Statistics band */}
        <section className="relative mt-16 overflow-hidden rounded-2xl" aria-labelledby="stats">
          <div className="relative min-h-56">
            <Image
              src="/images/catalog/svc-testing.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
            <h2 id="stats" className="sr-only">
              Company figures
            </h2>

            <dl className="grid w-full max-w-3xl grid-cols-2 gap-6 text-center text-white sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dd className="text-3xl font-bold sm:text-4xl">{stat.value}</dd>
                  <dt className="mt-1 text-xs text-white/70">{stat.label}</dt>
                </div>
              ))}
            </dl>

            <p className="max-w-md text-center text-xs text-white/60">
              Figures to be confirmed by the business before publication.
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">Talk to us</p>
          <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight">Tell us what you need</h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Send the specification, the plant or just the problem. An engineer will come back within
            one working day with something you can act on.
          </p>

          <Button asChild size="lg" className="mt-6">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </section>
      </Container>
    </>
  );
}
