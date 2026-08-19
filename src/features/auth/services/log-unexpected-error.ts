/**
 * The client only ever sees a generic message — never the real error — but
 * that error still needs to exist somewhere, or a production bug becomes
 * invisible. This is the one line every action's catch-all branch shares.
 */
export function logUnexpectedError(context: string, error: unknown): string {
  console.error(`[${context}] unexpected error`, error);
  return "Something went wrong. Please try again.";
}
