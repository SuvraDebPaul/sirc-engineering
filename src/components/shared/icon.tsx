import { createElement } from "react";
import type { LucideProps } from "lucide-react";

import { resolveIcon } from "@/lib/icons";

/**
 * Renders an icon from its stored *name*.
 *
 * Data holds `icon: "Crosshair"`, not a component, so records stay
 * serialisable. This does the lookup in one place.
 *
 * `createElement` rather than assigning the resolved component to a
 * capitalised local: hoisting a component inside render is what the
 * `no-create-components-during-render` rule warns about, and it is a real
 * hazard — a new component identity each render remounts the subtree.
 */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  return createElement(resolveIcon(name), props);
}
