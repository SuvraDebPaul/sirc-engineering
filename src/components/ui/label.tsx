import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Field label.
 *
 * A plain `<label>` rather than the Radix wrapper: the only thing that package
 * adds here is click-to-focus behaviour the browser already provides through
 * `htmlFor`, and this form is deliberately built to work without JavaScript.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-sm leading-none font-medium select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
