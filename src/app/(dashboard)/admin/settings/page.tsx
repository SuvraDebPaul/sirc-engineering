import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getSiteSettings } from "@/features/settings/services/settings";
import { SettingsForm } from "@/features/settings/components/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <h1 className="mt-4 text-xl font-semibold tracking-tight">Site settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything here used to be hardcoded in the site — the logo, contact details and social
        links every page reads.
      </p>

      <div className="mt-8">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
