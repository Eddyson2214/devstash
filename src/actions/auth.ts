"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { auth, signIn, signOut } from "@/auth";
import { issueVerificationEmail } from "@/lib/verification-token";

function withAuthMarker(url: string, marker: string): string {
  const isAbsolute = /^https?:\/\//i.test(url);
  const parsed = new URL(url, isAbsolute ? undefined : "http://localhost");
  parsed.searchParams.set("auth", marker);
  return isAbsolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
}

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");
  const redirectTo = typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: withAuthMarker(redirectTo, "login-success"),
    });
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

  await signIn("github", { redirectTo: withAuthMarker(redirectTo, "login-success") });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in?auth=logout-success" });
}

export async function resendVerificationEmail() {
  const session = await auth();
  if (!session?.user?.email || session.user.emailVerified) {
    return { success: false, error: "No unverified email on this account." };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;

  try {
    await issueVerificationEmail(session.user.email, origin);
    return { success: true };
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    return { success: false, error: "Failed to send verification email. Try again later." };
  }
}
