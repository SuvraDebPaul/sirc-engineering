import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  /** Percent change vs. the previous period. Omit when there's nothing to compare against yet. */
  change?: number;
  icon: LucideIcon;
}) {
  const trendingUp = (change ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>

          {change !== undefined && (
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                trendingUp ? "text-emerald-600" : "text-destructive",
              )}
            >
              {trendingUp ? (
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="size-3.5" aria-hidden="true" />
              )}
              {Math.abs(change)}% vs last month
            </p>
          )}
        </div>

        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
