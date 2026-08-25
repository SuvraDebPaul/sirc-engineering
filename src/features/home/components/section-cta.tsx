import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Section footer call to action.
 *
 * One component so every band ends the same way. Previously each section
 * invented its own — a red text link here, an outline button in the heading
 * there — which made the page read as several designs stitched together.
 *
 * Sitting at the *bottom* is deliberate: it is the natural next step once
 * you have scanned the row, whereas a "view all" in the heading invites you
 * to skip the content the section exists to show.
 *
 * Fills with the brand colour on hover rather than only tinting its border —
 * it's the one deliberate exit from a section, so it should read as a
 * destination, not a footnote. The arrow slides instead of the button
 * scaling: scaling a centred button nudges the layout under the cursor.
 */
export function SectionCta({
  href,
  label = "View all products",
}: {
  href: string;
  label?: string;
}) {
  return (
    <div className="mt-10 flex justify-center">
      <Button
        asChild
        variant="outline"
        className="group h-12 rounded-full border-border/80 px-7 text-sm font-medium shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
      >
        <Link href={href}>
          {label}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </Link>
      </Button>
    </div>
  );
}
