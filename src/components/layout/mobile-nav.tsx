"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone } from "lucide-react";

import Logo from "@/components/layout/logo";
import { Icon } from "@/components/shared/icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { contactInfo, type NavItem } from "@/config/site";
import type { Category } from "@/types";

/**
 * Mobile navigation drawer.
 *
 * Closes on any link tap, handled by one delegated listener rather than a prop
 * threaded through every link — same approach as the product filter drawer,
 * and for the same reason: leaving the sheet open over the page it just
 * navigated to hides the result of the tap.
 *
 * Categories sit behind an accordion so twenty-four of them do not bury the
 * four main sections underneath.
 */
export function MobileNav({
  nav,
  categories,
  counts,
}: {
  nav: NavItem[];
  categories: Category[];
  counts: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);

  const stocked = categories.filter((category) => (counts[category.name] ?? 0) > 0);
  const rest = categories.filter((category) => (counts[category.name] ?? 0) === 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open menu">
          <Menu className="size-4" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[88vw] overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Logo className="h-12" />
          </SheetTitle>
        </SheetHeader>

        <div
          className="flex flex-col gap-6 px-4 pb-8"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <nav aria-label="Main">
            <ul className="flex flex-col">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block border-b py-3 text-base font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Accordion type="single" collapsible>
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="py-2 text-base font-medium hover:no-underline">
                Shop by categories
              </AccordionTrigger>

              <AccordionContent>
                <ul className="flex flex-col gap-0.5 pt-1">
                  {[...stocked, ...rest].map((category) => {
                    const count = counts[category.name] ?? 0;

                    return (
                      <li key={category.id}>
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex items-center gap-2.5 rounded-md p-2 text-sm transition-colors hover:bg-muted"
                        >
                          <Icon
                            name={category.icon}
                            className={
                              count > 0
                                ? "size-4 shrink-0 text-primary"
                                : "size-4 shrink-0 text-muted-foreground/40"
                            }
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          <span className={count > 0 ? "flex-1" : "flex-1 text-muted-foreground"}>
                            {category.name}
                          </span>
                          {count > 0 && (
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {count}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/rfq">Request a quotation</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <a href={`tel:${contactInfo.phone}`}>
                <Phone className="size-4" aria-hidden="true" />
                {contactInfo.phone}
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
