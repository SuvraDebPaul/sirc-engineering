import { BadgeCheck, ShieldCheck, Truck } from "lucide-react";

/**
 * The reassurance block under the buy buttons.
 *
 * Every claim here is one the business can actually stand behind, and each is
 * stated elsewhere on the site — genuine stock, a traceable certificate,
 * nationwide delivery. The reference design puts a row of card-brand logos in
 * this position; that is missing deliberately, because which payment methods
 * are accepted has not been confirmed and printing a Visa mark the business
 * does not take would be a promise made on its behalf.
 */
const BADGES = [
  { icon: BadgeCheck, label: "100% genuine", note: "Sourced through authorised channels" },
  { icon: ShieldCheck, label: "Certificate included", note: "Traceable to national standards" },
  { icon: Truck, label: "Nationwide delivery", note: "All 64 districts" },
] as const;

export function ProductAssurance() {
  return (
    <div className="space-y-4">
      <ul className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
        {BADGES.map(({ icon: Icon, label, note }) => (
          <li key={label} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-tight">{label}</span>
              <span className="block text-xs text-muted-foreground">{note}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border p-4 text-center">
        <p className="text-sm font-medium">Guaranteed safe and secure checkout</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Accepted payment methods are confirmed at checkout. Purchase orders welcome from
          registered businesses.
        </p>
      </div>
    </div>
  );
}
