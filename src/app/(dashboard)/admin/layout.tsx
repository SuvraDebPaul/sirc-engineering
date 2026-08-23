import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";
import { getSiteSettings } from "@/features/settings/services/settings";
import { DashboardShell } from "@/features/admin/components/dashboard-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  // /admin/login hasn't existed since the folder move to (auth)/login — this
  // used to redirect there, which meant an unauthenticated visit to any
  // admin page landed on a 404 instead of a sign-in form.
  if (!session) redirect("/login");

  // Session alone isn't authorization: any signed-up customer has a valid
  // session too. Only staff belong past this point.
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    redirect("/");
  }

  const settings = await getSiteSettings();

  return (
    <DashboardShell
      logoUrl={settings.logoUrl ?? undefined}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
