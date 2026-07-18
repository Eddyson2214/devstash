"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");
  const redirectTo = typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard";

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      const params = new URLSearchParams({ error: error.type });
      if (typeof callbackUrl === "string" && callbackUrl) {
        params.set("callbackUrl", callbackUrl);
      }
      redirect(`/sign-in?${params.toString()}`);
    }
    throw error;
  }
}

export async function signInWithGitHub(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl");
  const redirectTo = typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard";

  await signIn("github", { redirectTo });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
