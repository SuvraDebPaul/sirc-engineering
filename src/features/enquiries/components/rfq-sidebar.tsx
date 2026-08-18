import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { getSiteSettings } from "@/features/settings/services/settings";

/**
 * Support column beside the form.
 *
 * Two jobs: say what happens after the button is pressed, and offer a way
 * round the form entirely. A quotation request is a commitment of effort, and
 * people abandon forms when they cannot tell whether anyone is on the other
 * end — so the process is spelled out, and the phone number is right there for
 * anyone who would rather just ask.
 */
const STEPS = [
  {
    title: "We read it, not a bot",
    body: "An applications engineer reviews what you have asked for and checks it against stock and lead times.",
  },
  {
    title: "You get a written quotation",
    body: "Itemised, with delivery dates and any calibration or training included. Within one working day.",
  },
  {
    title: "Questions before you commit",
    body: "If the specification needs adjusting, we will say so rather than quoting the wrong instrument.",
  },
];

export async function RfqSidebar() {
  const contactInfo = await getSiteSettings();

  return (
    <aside className="space-y-5" aria-label="How this works">
      <section className="rounded-2xl border bg-card p-6">
        <h2 className="text-sm font-semibold tracking-tight">What happens next</h2>

        <ol className="mt-5 space-y-5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3.5">
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
              >
                {index + 1}
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-medium leading-tight">{step.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border bg-muted/30 p-6">
        <h2 className="text-sm font-semibold tracking-tight">Rather talk to someone?</h2>

        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <a href={`tel:${contactInfo.phone}`} className="hover:text-primary">
              {contactInfo.phone}
            </a>
          </li>

          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <a href={`mailto:${contactInfo.email}`} className="break-all hover:text-primary">
              {contactInfo.email}
            </a>
          </li>

          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-muted-foreground">{contactInfo.hours}</span>
          </li>

          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-muted-foreground">{contactInfo.address}</span>
          </li>
        </ul>
      </section>
    </aside>
  );
}
