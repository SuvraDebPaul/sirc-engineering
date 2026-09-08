import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Cross-request caching for the public site.
 *
 * Every public page reads the same handful of tables — the catalogue, the
 * marketing content, the site settings — and none of it changes between one
 * visitor and the next. React's `cache()` only dedupes within a single
 * render, so without this every request re-ran every query against the
 * database. On a metered host that is the entire monthly allowance spent on
 * serving identical bytes.
 *
 * Reads are wrapped in `unstable_cache` under these tags; admin mutations
 * call `revalidatePublicData()`, so an edit still shows up immediately
 * rather than after a timeout.
 */
export const CACHE_TAGS = {
  catalog: "catalog",
  content: "content",
  settings: "settings",
} as const;

/**
 * A day, not a few minutes.
 *
 * The tags below are invalidated explicitly whenever an admin changes
 * anything, so this duration is only the backstop for a write that somehow
 * bypassed an action — not the mechanism keeping the site current. A short
 * window here would mean re-querying everything hourly for no benefit.
 */
export const CACHE_DURATION_SECONDS = 60 * 60 * 24;

/**
 * Invalidate everything a visitor can see.
 *
 * Deliberately coarse: admin edits happen a few times a day, so dumping all
 * three tags costs a handful of extra queries, while per-entity tags would
 * cost a category of bugs where someone adds a mutation and forgets to
 * invalidate the one list it appears in.
 *
 * The `revalidatePath` keeps the existing behaviour for the rendered route
 * cache — the tags alone would refresh the data but not pages already
 * rendered from it.
 */
export function revalidatePublicData(): void {
  // The two-argument form: passing only the tag is deprecated in this
  // version. `"max"` is the recommended profile — it marks the entry stale
  // and refreshes it in the background. The `revalidatePath` below is the
  // hard invalidation that makes an admin's own edit show up immediately
  // rather than one render later.
  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.content, "max");
  revalidateTag(CACHE_TAGS.settings, "max");
  revalidatePath("/", "layout");
}
