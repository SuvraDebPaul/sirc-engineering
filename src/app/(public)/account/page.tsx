import Link from "next/link";
import { Heart, MapPin, Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { listAddresses } from "@/features/account/services/addresses";
import { listOrdersForUser } from "@/features/account/services/orders";
import { requireSession } from "@/lib/require-session";
import { prisma } from "@/lib/db/prisma";

export default async function AccountOverviewPage() {
  const session = await requireSession();

  const [orders, addresses, wishlistCount] = await Promise.all([
    listOrdersForUser(session.user.id),
    listAddresses(session.user.id),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
  ]);

  const cards = [
    { href: "/account/orders", icon: Package, label: "Orders", count: orders.length },
    { href: "/account/addresses", icon: MapPin, label: "Saved addresses", count: addresses.length },
    { href: "/account/wishlist", icon: Heart, label: "Wishlist", count: wishlistCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Welcome back, {session.user.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your orders, saved addresses and wishlist from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ href, icon: Icon, label, count }) => (
          <Link key={href} href={href}>
            <Card className="transition-colors hover:border-primary">
              <CardContent className="flex items-center gap-4 p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-2xl font-semibold tabular-nums">{count}</span>
                  <span className="block text-sm text-muted-foreground">{label}</span>
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
