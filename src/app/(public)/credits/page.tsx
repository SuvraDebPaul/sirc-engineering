import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { IMAGE_CREDITS } from "@/data";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Attribution for photography used on this site.",
  robots: { index: false, follow: true },
};

/**
 * Image attribution.
 *
 * Not optional decoration: the demo photography is largely CC BY-SA, which
 * requires the author, the licence and a link to the source. This page is what
 * makes using those images lawful.
 *
 * When real product photography replaces the placeholders, delete the entries
 * — and this page with the last of them.
 */
export default function CreditsPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Image credits</h1>

        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Demo photography on this site comes from Wikimedia Commons. Each image is listed below
          with its author and licence, as those licences require. Product photography will replace
          these before launch.
        </p>

        <ul className="mt-8 divide-y border-t text-sm">
          {IMAGE_CREDITS.map((credit) => (
            <li key={credit.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
              <span className="font-medium">{credit.title}</span>
              <span className="text-muted-foreground">by {credit.author || "Unknown"}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{credit.licence}</span>
              <a
                href={credit.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                Source
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
