import { headers } from "next/headers";

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

      <p className="mt-8 text-sm text-muted-foreground">
        This is a placeholder — the real dashboard (products, categories,
        orders, content) comes next.
      </p>
    </div>
  );
}
