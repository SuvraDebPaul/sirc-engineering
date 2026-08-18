/**
 * Zod's `fieldErrors` gives an array of messages per field; every form here
 * shows exactly one message per field. This picks the first.
 */
export function firstFieldErrors<
  T extends Record<string, string[] | undefined>,
>(fieldErrors: T): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key in fieldErrors) {
    const messages = fieldErrors[key];
    if (messages && messages.length > 0) errors[key] = messages[0];
  }
  return errors;
}
