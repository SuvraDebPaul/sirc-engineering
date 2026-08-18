import { CartProvider } from "@/features/cart/components/cart-provider";
import { Footer } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getProducts } from "@/features/catalog/services";

/**
 * Public site shell.
 *
 * The header and footer own their own containers now — both are full-bleed
 * bands with contained contents, which the layout cannot express by wrapping
 * them from outside. `main` stays unwrapped for the same reason: pages supply
 * their own `Container` so a page can put a full-width band between two
 * contained sections.
 *
 * Both render on the server, so the chrome on every page costs nothing in
 * hydration.
 */
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  // The catalogue is handed to the cart so stored lines always resolve against
  // current prices rather than whatever they cost when they were added.
  const products = await getProducts();

  return (
    <CartProvider products={products}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* One tap to a human, on every page. In this market it converts better
          than any form — and it is a plain link, so it costs nothing. */}
      <WhatsAppButton
        variant="floating"
        message="Hello, I have a question about your instruments and services."
      />
    </CartProvider>
  );
}
