import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/db/auth";

/**
 * The current session, looked up once per request.
 *
 * `auth.api.getSession()` is a database round trip (session row, then the
 * user row). The public layout and the site header both need it, and both
 * used to call it independently — two lookups on every page view of every
 * page. React's `cache()` collapses them into one for the duration of a
 * single render.
 *
 * This cannot be an `unstable_cache`: it reads request headers, and the
 * answer is different for every visitor. Better Auth's `cookieCache` (see
 * `auth.ts`) is what keeps the common case off the database entirely.
 */
export const getCurrentSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
