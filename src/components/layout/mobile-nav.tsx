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
import type { NavItem } from "@/config/site";
import type { Category } from "@/features/catalog/types";

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
  phone,
  logoUrl,
}: {
  nav: NavItem[];
  categories: Category[];
  counts: Record<string, number>;
  phone: string;
  logoUrl?: string;
}) {
  const [open, setOpen] = useState(false);

  // Stocked categories lead, both at the top level and within each parent's
  // own children — the flatter walk stays intact, it's just grouped in two
  // passes instead of one.
  const byStock = (list: Category[]) => [
    ...list.filter((category) => (counts[category.name] ?? 0) > 0),
    ...list.filter((category) => (counts[category.name] ?? 0) === 0),
  ];

  const childrenOf = (parentId: string) =>
    byStock(categories.filter((category) => category.parentId === parentId));

  const topLevel = byStock(categories.filter((category) => category.parentId === null));

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
            <Logo src={logoUrl} className="h-12" />
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
                  {topLevel.flatMap((category) => {
                    const row = (entry: Category, indent: boolean) => {
                      const count = counts[entry.name] ?? 0;

                      return (
                        <li key={entry.id}>
                          <Link
                            href={`/category/${entry.slug}`}
                            className="flex items-center gap-2.5 rounded-md p-2 text-sm transition-colors hover:bg-muted"
                            style={indent ? { paddingLeft: "2.25rem" } : undefined}
                          >
                            <Icon
                              name={entry.icon}
                              className={
                                count > 0
                                  ? "size-4 shrink-0 text-primary"
                                  : "size-4 shrink-0 text-muted-foreground/40"
                              }
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                            <span className={count > 0 ? "flex-1" : "flex-1 text-muted-foreground"}>
                              {entry.name}
                            </span>
                            {count > 0 && (
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {count}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    };

                    return [
                      row(category, false),
                      ...childrenOf(category.id).map((child) => row(child, true)),
                    ];
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
              <a href={`tel:${phone}`}>
                <Phone className="size-4" aria-hidden="true" />
                {phone}
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
