import type { Metadata } from "next";

import { CartContents } from "@/components/cart/cart-contents";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the instruments in your cart before checkout.",
  // A personal cart has nothing to offer a search engine and should not be
  // indexed under any circumstances.
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHeader title="Cart" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <Container className="pb-20">
        <CartContents />
      </Container>
    </>
  );
}
