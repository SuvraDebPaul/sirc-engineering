import { headers } from "next/headers";
import Link from "next/link";
import { Settings } from "lucide-react";

import { auth } from "@/lib/db/auth";
import { SignOutButton } from "@/features/admin/components/sign-out-button";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {session?.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      <Link
        href="/admin/settings"
        className="mt-8 flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50"
      >
        <Settings className="size-5 text-primary" aria-hidden="true" />
        <span>
          <span className="block text-sm font-medium">Site settings</span>
          <span className="block text-sm text-muted-foreground">
            Logo, contact details and social links
          </span>
        </span>
      </Link>

      <p className="mt-6 text-sm text-muted-foreground">
        More sections — products, categories, orders, content — come next.
      </p>
    </div>
  );
}
