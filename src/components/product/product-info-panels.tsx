import { Truck } from "lucide-react";

import type { SpecRow } from "@/types";

/**
 * Specification table.
 *
 * A real `<table>` with row headers, not a grid of divs: this is tabular data,
 * and the markup should say so to anything reading the page without seeing it.
 * Rows are zebra-striped and the whole thing scrolls inside its own container
 * so a long value can never widen the page.
 */
export function ProductSpecs({ specs }: { specs: SpecRow[] }) {
  if (specs.length === 0) {
    return <p className="text-sm text-muted-foreground">No specifications recorded for this item.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-md border-collapse text-sm">
        <caption className="sr-only">Technical details</caption>
        <tbody>
          {specs.map((spec, index) => (
            <tr key={spec.label} className={index % 2 === 0 ? "bg-muted/40" : undefined}>
              <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium">
                {spec.label}
              </th>
              <td className="px-4 py-3 text-muted-foreground">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Shipping and returns, as a plain list of commitments. */
export function ProductShipping({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <Truck className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
