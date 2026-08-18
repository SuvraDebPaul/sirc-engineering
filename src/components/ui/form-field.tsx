import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Label, control, hint and error — wired together once.
 *
 * This existed in three near-identical copies: the quotation form, the contact
 * form and the checkout. Each derived `id`, `name`, `aria-invalid` and
 * `aria-describedby` by hand, which is exactly the set of attributes most
 * easily left inconsistent — and an `aria-describedby` pointing at an id that
 * does not exist is silent to everyone except the screen reader user it fails.
 *
 * The control arrives as a function so each field can be a different element
 * (input, textarea, native select) while the wiring is derived in one place
 * and cannot drift between forms.
 *
 * Hint and error never render together: once a field is wrong, the correction
 * matters more than the advice, and stacking both pushes the next field down
 * the screen mid-correction.
 */
export interface FieldRenderProps {
  id: string;
  name: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

export function FormField({
  name,
  label,
  hint,
  error,
  required,
  className,
  /** Overrides the derived id when a page mounts two forms sharing field names. */
  idPrefix,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  idPrefix?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}) {
  const id = idPrefix ? `${idPrefix}-${name}` : name;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </Label>

      {children({
        id,
        name,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
