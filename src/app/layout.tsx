import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/features/settings/services/settings";
import { cn } from "@/lib/utils";

import "./globals.css";

/**
 * Two families, not four. Every additional font is another file on the
 * critical path — Inter carries the interface, Instrument Serif is used only
 * for the display accent in the hero.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-heading",
  display: "swap",
});

/**
 * Title, description and OpenGraph tags come from the DB-backed site settings
 * — `metadataBase`/`locale` stay in `config/site.ts`, since those are
 * deployment concerns (which URL, which locale) rather than editable content.
 * A static `metadata` export can't read the database, so this is
 * `generateMetadata` instead — it runs per request, same as any Server
 * Component.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${settings.name} — ${settings.shortDescription}`,
      template: `%s · ${settings.name}`,
    },
    description: settings.description,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: settings.name,
      title: `${settings.name} — ${settings.shortDescription}`,
      description: settings.description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", inter.variable, instrumentSerif.variable)}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
