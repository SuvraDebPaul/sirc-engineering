import type { Metadata } from "next";

import { WishlistContents } from "@/components/cart/wishlist-contents";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Instruments you have saved for later.",
  robots: { index: false, follow: true },
};

/**
 * Saved items.
 *
 * The catalogue is fetched on the server and filtered on the client against
 * the stored ids, so the page ships product data once and needs no lookup
 * endpoint. The list itself never leaves the browser.
 */
export default async function WishlistPage() {
  const products = await getProducts();

  return (
    <>
      <PageHeader
        title="Wishlist"
        description="Saved on this device — no account required."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />

      <Container className="pb-20">
        <WishlistContents products={products} />
      </Container>
    </>
  );
}
