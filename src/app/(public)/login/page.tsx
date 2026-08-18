import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { LoginForm } from "@/components/layout/login-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Trade account and staff sign-in.",
  // Nothing to index, and no reason to invite crawlers to a credential form.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <PageHeader
        title="Sign in"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sign in" }]}
      />

      <Container className="pb-20">
        <LoginForm />
      </Container>
    </>
  );
}
