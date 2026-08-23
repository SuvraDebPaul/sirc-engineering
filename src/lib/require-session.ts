import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";

/** Any signed-in user — customer, manager or admin. Unlike `requireStaffSession`, role is not checked. */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}
