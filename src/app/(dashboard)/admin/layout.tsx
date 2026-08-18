import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/admin/login");
  }

  return <div className="min-h-screen bg-muted/20">{children}</div>;
}
