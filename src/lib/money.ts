/**
 * Poisha is this app's money unit everywhere — avoids float rounding on
 * money. Admins think in taka, so forms collect taka as plain text and this
 * converts at the boundary between the form and the database.
 */
export function takaToPoisha(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function poishaToTaka(value: number | null): string {
  if (value === null) return "";
  return (value / 100).toFixed(2);
}
