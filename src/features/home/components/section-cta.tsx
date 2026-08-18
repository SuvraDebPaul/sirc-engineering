import Link from "next/link";

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
      <Button asChild variant="outline" className="h-11 rounded-lg px-6">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
