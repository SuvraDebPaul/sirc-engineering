import { headers } from "next/headers";

import { CartProvider } from "@/features/cart/components/cart-provider";
import { Footer } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getProducts } from "@/features/catalog/services";
import { getSiteSettings } from "@/features/settings/services/settings";
import { auth } from "@/lib/db/auth";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [products, settings, session] = await Promise.all([
    getProducts(),
    getSiteSettings(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  return (
    <CartProvider products={products} userId={session?.user.id ?? null}>
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
