import type { IconName } from "@/lib/icons";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: IconName;
  /** Optional photograph for category tiles; the icon is the fallback. */
  imageUrl?: string;
  /** Shown on the category grid so the tile is not just a label. */
  productCount?: number;
  /** Null for a top-level category; otherwise the parent's id. */
  parentId: string | null;
}
