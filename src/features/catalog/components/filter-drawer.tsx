"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Mobile access to the filter sidebar.
 *
 * The panel itself stays a server component — it is passed in as `children`,
 * rendered on the server and slotted into the sheet, so the only JavaScript
 * this adds is the open/close state. Below `lg` the sidebar has nowhere to go,
 * and burying six facet groups above the results would push the products off
 * the first screen entirely.
 *
 * Every control inside is a link, so the sheet closes on any link click rather
 * than watching the URL for changes: without closing it would sit over the
 * results it just changed, hiding the outcome of the tap. Handling it on the
 * click means the state is set by the interaction that caused it, instead of
 * being synchronised after the fact in an effect.
 */
export function FilterDrawer({
  children,
  activeCount,
}: {
  children: React.ReactNode;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 grid size-5 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[88vw] overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the catalogue by category, brand, availability, price or rating.</SheetDescription>
        </SheetHeader>

        {/* Delegated: the panel is a server component passed in as children, so
            the close has to be handled by a listener above it rather than by a
            prop threaded onto every facet link. */}
        <div
          className="px-4 pb-8"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
