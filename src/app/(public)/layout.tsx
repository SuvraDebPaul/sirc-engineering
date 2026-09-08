import { CartProvider } from "@/features/cart/components/cart-provider";
import { Footer } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getProducts } from "@/features/catalog/services";
import { getSiteSettings } from "@/features/settings/services/settings";
import { getCurrentSession } from "@/lib/db/session";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [products, settings, session] = await Promise.all([
    getProducts(),
    getSiteSettings(),
    getCurrentSession(),
  ]);

  return (
    <CartProvider products={products} userId={session?.user.id ?? null}>
      <SmoothScrollProvider />
      <SiteHeader />
      <main className="flex-1 bg-[#F5F5F5]">{children}</main>
      <Footer />
      <WhatsAppButton
        whatsapp={settings.whatsapp}
        variant="floating"
        message="Hello, I have a question about your instruments and services."
      />
    </CartProvider>
  );
}
