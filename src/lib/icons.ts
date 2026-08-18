/**
 * Icon registry.
 *
 * The single source of truth for icons the site can render. Category data
 * stores an icon *name*, not a component, so the data stays serialisable and
 * can cross the network from a route handler or a real API later.
 *
 * An admin icon picker should be built from `Object.keys(ICON_MAP)` so it is
 * impossible to save an icon the site does not ship.
 */
import {
  BatteryCharging,
  Construction,
  Crosshair,
  Cog,
  Drill,
  Drone,
  Fan,
  FlaskConical,
  Gauge,
  GraduationCap,
  Hammer,
  HardHat,
  Network,
  Package,
  PlugZap,
  Ruler,
  ScanSearch,
  ShieldCheck,
  Shovel,
  SprayCan,
  Sun,
  Thermometer,
  UtilityPole,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Only the icons actually used by the category taxonomy.
 * Keep this map as the single source of truth — the storefront renders from it
 * and the CRM icon dropdown should be built from `Object.keys(ICON_MAP)` so an
 * admin can never save an icon the storefront doesn't ship.
 */
export const ICON_MAP = {
  BatteryCharging,
  Construction,
  Crosshair,
  Cog,
  Drill,
  Drone,
  Fan,
  FlaskConical,
  Gauge,
  GraduationCap,
  Hammer,
  HardHat,
  Network,
  PlugZap,
  Ruler,
  ScanSearch,
  ShieldCheck,
  Shovel,
  SprayCan,
  Sun,
  Thermometer,
  UtilityPole,
  Wrench,
  Zap,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_MAP;

export const FALLBACK_ICON: LucideIcon = Package;

/** Resolve a stored icon name, falling back rather than rendering nothing. */
export const resolveIcon = (name: string): LucideIcon =>
  (ICON_MAP as Record<string, LucideIcon>)[name] ?? FALLBACK_ICON;
