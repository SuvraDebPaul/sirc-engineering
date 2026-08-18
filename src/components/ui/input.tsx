import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Text input.
 *
 * Styling hangs off `aria-invalid` rather than a separate `error` prop, so the
 * attribute that tells assistive technology the field is wrong is the same one
 * that turns it red. The two can never disagree.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
        "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "md:text-sm dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
