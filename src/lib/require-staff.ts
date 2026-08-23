// src/lib/require-staff.ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";

export async function requireStaffSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "admin" && session.user.role !== "manager")
    redirect("/");
  return session;
}
