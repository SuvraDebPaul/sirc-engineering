import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { RemoveWishlistButton } from "@/features/account/components/remove-wishlist-button";
import { listWishlistForUser } from "@/features/account/services/wishlist";
import { formatBDT } from "@/lib/format";
import { requireSession } from "@/lib/require-session";

export default async function AccountWishlistPage() {
  const session = await requireSession();
  const items = await listWishlistForUser(session.user.id);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Items you save while signed in appear here, so they follow you across devices."
        actions={
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Saved items</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ id, product }) => (
          <Card key={id}>
            <CardContent className="flex gap-4 p-4">
              <Link
                href={`/product/${product.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted"
              >
                {product.imageUrl && (
                  <Image src={product.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${product.slug}`}
                  className="line-clamp-2 text-sm font-medium hover:text-primary"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {product.retailPrice !== null ? formatBDT(product.retailPrice) : "Price on request"}
                </p>
                <div className="mt-2">
                  <RemoveWishlistButton productId={product.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
