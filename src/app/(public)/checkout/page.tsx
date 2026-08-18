import type { Metadata } from "next";

import { CheckoutForm } from "@/components/cart/checkout-form";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your order. We invoice after confirming stock — nothing is charged online.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        title="Checkout"
        description="We confirm stock and lead time, then invoice. No payment is taken on this site."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <Container className="pb-20">
        <CheckoutForm />
      </Container>
    </>
  );
}
