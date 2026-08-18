"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";

export async function signInWithGoogle() {
  const { url } = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/", // placeholder — step 8 makes this role-aware
    },
  });

  if (!url) throw new Error("Could not start Google sign-in.");
  redirect(url);
}
