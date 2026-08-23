import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Factory,
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package,
  Quote,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

/** The whole admin sidebar in one place. Every href here needs a matching page. */
export const ADMIN_NAV: AdminNavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Brands", href: "/admin/brands", icon: BadgeCheck },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Services", href: "/admin/services", icon: Wrench },
      { label: "Industries", href: "/admin/industries", icon: Factory },
      { label: "Promotions", href: "/admin/promotions", icon: Megaphone },
      { label: "Features", href: "/admin/features", icon: Sparkles },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
      { label: "Product Q&A", href: "/admin/questions", icon: HelpCircle },
    ],
  },
  {
    title: "Configuration",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
];
